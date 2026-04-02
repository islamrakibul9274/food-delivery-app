import React, { useState, useEffect } from 'react';
import axiosPublic from '../api/axiosPublic';

const UserProfile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user-info')));
    const [newName, setNewName] = useState(user?.name || "");

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // We'll need to create this route on the backend next!
            const res = await axiosPublic.put(`/users/update-profile/${user.id}`, { name: newName });
            
            if (res.status === 200) {
                // Update LocalStorage so the Navbar name changes immediately!
                const updatedUser = { ...user, name: newName };
                localStorage.setItem('user-info', JSON.stringify(updatedUser));
                setUser(updatedUser);
                alert("Profile Updated! Check your Navbar.");
                window.location.reload(); // Refresh to sync Navbar
            }
        } catch (err) {
            alert("Update failed");
        }
    };

    return (
        <div className="max-w-md mx-auto my-20 p-8 border rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-red-600">Your Profile</h2>
            <p className="text-gray-500 mb-4">Email: {user?.email}</p>
            
            <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                    <label className="block text-sm mb-1">Update Name</label>
                    <input 
                        className="w-full p-2 border rounded outline-none focus:border-red-500"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                </div>
                <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg font-light">
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default UserProfile;