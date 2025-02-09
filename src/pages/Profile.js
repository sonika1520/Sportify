import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css"; // Ensure this CSS file exists

export default function Profile() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        age: "",
        gender: "",
        sports: [],
    });

    const [dropdownOpen, setDropdownOpen] = useState(false);

    const sportsOptions = ["Football", "Basketball", "Tennis", "Cricket", "Soccer", "Baseball"];

    // Handle Input Changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle Sports Selection
    const handleSportsChange = (sport) => {
        const updatedSports = formData.sports.includes(sport)
            ? formData.sports.filter((s) => s !== sport) // Remove if already selected
            : [...formData.sports, sport]; // Add if not selected

        setFormData({ ...formData, sports: updatedSports });
    };

    // Submit Handler
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Profile Data:", formData);
        navigate("/dashboard"); // Redirect after submission
    };

    return (
        <div className="profile-container">
            <div className="profile-left">
                <h1>SPORT!FY</h1>
                <p>Connect with friends and the world around you on Sportify.</p>
            </div>

            <div className="profile-right">
                <form className="profile-box" onSubmit={handleSubmit}>
                    <h2>Profile</h2>

                    <label>First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        placeholder="Enter first name"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />

                    <label>Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Enter last name"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />

                    <label>Age</label>
                    <input
                        type="number"
                        name="age"
                        placeholder="Enter age"
                        value={formData.age}
                        onChange={handleChange}
                        required
                    />

                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} required>
                        <option value="" disabled>Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Others">Others</option>
                    </select>

                    <label>Sports Preferences</label>
                    <div className="dropdown">
                        <button
                            type="button"
                            className="dropdown-button"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            Select Sports ▾
                        </button>
                        {dropdownOpen && (
                            <div className="dropdown-content">
                                {sportsOptions.map((sport) => (
                                    <label key={sport} className="dropdown-item">
                                        <input
                                            type="checkbox"
                                            checked={formData.sports.includes(sport)}
                                            onChange={() => handleSportsChange(sport)}
                                        />
                                        <span>{sport}</span> {/* Added span for proper spacing */}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>



                    <button type="submit" className="profile-button">
                        Let's Play
                    </button>
                </form>
            </div>
        </div>
    );
}
