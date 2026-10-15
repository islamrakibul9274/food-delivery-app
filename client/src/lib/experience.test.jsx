// @vitest-environment jsdom
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AppProvider from "../providers/AppProvider";
import Menu, { ProductDetails } from "../views/Menu";
import Cart from "../views/Cart";
import Auth from "../views/Auth";
import Protected from "../components/Protected";
const dish = {
  _id: "abc",
  slug: "house-burger",
  name: "The house burger",
  category: "Burger",
  price: 8.5,
  image: "/food/burger.jpg",
  description: "Beef with cheese.",
  available: true,
  featured: true,
  addOns: [{ key: "cheese", name: "Extra cheese", priceCents: 100 }],
};
const config = {
  name: "FOOD",
  currency: "USD",
  deliveryFeeCents: 200,
  minimumCents: 0,
  deliveryAreas: ["Preview delivery area"],
  pickupEnabled: true,
  orderingEnabled: true,
};
let currentUser = null;
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
beforeEach(() => {
  localStorage.clear();
  currentUser = null;
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, options = {}) => {
      if (url === "/api/settings") return json(config);
      if (url === "/api/products")
        return json([
          dish,
          {
            ...dish,
            _id: "pizza",
            slug: "pizza",
            name: "Margherita pizza",
            category: "Pizza",
            price: 11,
          },
        ]);
      if (url === "/api/auth/me")
        return currentUser
          ? json(currentUser)
          : json({ message: "Sign in" }, 401);
      if (url === "/api/auth/login") {
        currentUser = {
          id: "user",
          name: "Alice",
          email: "alice@example.test",
          role: "user",
        };
        return json(currentUser);
      }
      if (url === "/api/orders" && options.method === "POST")
        return json({ _id: "order1" }, 201);
      return json({});
    }),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function mount(element, path = "/") {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>
    </AppProvider>,
  );
}
describe("customer journeys", () => {
  it("menu search and categories change the actual dishes displayed", async () => {
    const user = userEvent.setup();
    mount(<Menu />, "/menu");
    await screen.findByRole("heading", { name: "The house burger" });
    await user.click(screen.getByRole("button", { name: "Pizza" }));
    expect(
      screen.queryByRole("heading", { name: "The house burger" }),
    ).toBeNull();
    expect(
      screen.getByRole("heading", { name: "Margherita pizza" }),
    ).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Everything" }));
    await user.type(
      screen.getByRole("searchbox", { name: "Search the menu" }),
      "not a dish",
    );
    expect(screen.getByText("Nothing on this plate yet.")).toBeTruthy();
  });
  it("dish options are kept as selections and included in the cart total", async () => {
    const user = userEvent.setup();
    mount(
      <Routes>
        <Route path="/menu/:slug" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>,
      "/menu/house-burger",
    );
    await screen.findByRole("checkbox", { name: /Extra cheese/ });
    await user.click(screen.getByRole("checkbox", { name: /Extra cheese/ }));
    await user.click(screen.getByRole("button", { name: /Add to bag/ }));
    await screen.findByRole("heading", { name: "Order summary" });
    expect(
      JSON.parse(localStorage.getItem("food-cart"))[0].selectedAddOns,
    ).toEqual(["cheese"]);
    expect(screen.getByText("$11.50")).toBeTruthy();
  });
  it("removing an item updates the persistent cart after confirmation", async () => {
    localStorage.setItem(
      "food-cart",
      JSON.stringify([{ ...dish, quantity: 2 }]),
    );
    const user = userEvent.setup();
    mount(<Cart />, "/cart");
    await screen.findByRole("button", { name: "Remove The house burger" });
    await user.click(
      screen.getByRole("button", { name: "Remove The house burger" }),
    );
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    await screen.findByText("Your bag is taking a breather.");
    expect(JSON.parse(localStorage.getItem("food-cart"))).toEqual([]);
  });
  it("login sets the current session and returns to the requested checkout route", async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <MemoryRouter
          initialEntries={[
            { pathname: "/login", state: { from: { pathname: "/checkout" } } },
          ]}
        >
          <Routes>
            <Route path="/login" element={<Auth />} />
            <Route element={<Protected />}>
              <Route path="/checkout" element={<p>Checkout is ready</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AppProvider>,
    );
    await user.type(
      screen.getByLabelText("Email address"),
      "alice@example.test",
    );
    await user.type(screen.getByLabelText("Password"), "test-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await screen.findByText("Checkout is ready");
  });
  it("a normal account cannot open the admin route even with forged localStorage", async () => {
    currentUser = { id: "user", name: "Alice", role: "user" };
    localStorage.setItem("user-info", JSON.stringify({ role: "admin" }));
    mount(
      <Routes>
        <Route element={<Protected admin />}>
          <Route path="/admin" element={<p>Secret admin content</p>} />
        </Route>
      </Routes>,
      "/admin",
    );
    await screen.findByText("This table is reserved.");
    expect(screen.queryByText("Secret admin content")).toBeNull();
  });
  it("checkout sends product IDs and quantities and retains the bag on failure", async () => {
    currentUser = { id: "user", name: "Alice", role: "user" };
    localStorage.setItem(
      "food-cart",
      JSON.stringify([{ ...dish, quantity: 2 }]),
    );
    const original = fetch.getMockImplementation();
    fetch.mockImplementation(async (url, options) =>
      url === "/api/orders"
        ? json({ message: "Kitchen unavailable" }, 503)
        : original(url, options),
    );
    const user = userEvent.setup();
    mount(<Cart checkout />, "/checkout");
    await screen.findByRole("button", { name: "Place order" });
    await user.type(screen.getByLabelText("Phone number"), "123456789");
    await user.type(
      screen.getByLabelText("Street address & apartment"),
      "12 Test Street",
    );
    await user.selectOptions(
      screen.getByLabelText("Delivery area"),
      "Preview delivery area",
    );
    await user.click(screen.getByRole("button", { name: "Place order" }));
    await screen.findByText("Kitchen unavailable");
    const call = fetch.mock.calls.find(([url]) => url === "/api/orders");
    const body = JSON.parse(call[1].body);
    expect(body.items).toEqual([
      { productId: "abc", quantity: 2, note: "", addOns: [] },
    ]);
    expect(body.expectedTotalCents).toBe(1900);
    expect(body.email).toBeUndefined();
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem("food-cart"))).toHaveLength(1),
    );
  });
});
