
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
        navigate("/home"); // Redirect after submission
    };

    return (
        <div className="profile-container">
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "row" }}>
                <div style={{ backgroundColor: "black", width: '32%', padding: "50px", opacity: "80%", color: "white", alignContent: "center", textAlign: "center", justifyContent: "center" }} className="relative w-1/2 flex flex-col justify-center items-center text-white p-10">

                    <div className="relative z-10 text-center">
                        <h1 style={{ fontSize: "80px", fontFamily: "sans-serif", marginBottom: "20px" }}><i>SPORT!FY</i></h1>
                        <p style={{ fontSize: "20px" }}>
                            Connect with friends and the world around you through sports. Find people who share your love for sports, join local events, and never miss a game again. Whether you're an athlete, a casual player, or just a fan, Sportify connects you to the world of sports like never before!
                        </p>
                    </div>
                </div>

            <div style={{ flex: 1, }} className="profile-right">
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



                    <button style={{marginTop:"20px"}} onClick={() => navigate("/Home")} type="submit" className="profile-button">
                        Let's Play
                    </button>
                </form>
            </div>
            </div>
        </div>
    );
}



