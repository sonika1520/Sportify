import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MyProfile from "../pages/MyProfile";

//Mocking useNavigate globally
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate, // Mock useNavigate
}));

describe("My Profile Page Unit Tests", () => {
  it("should render the My profile form correctly", () => {
    render(
      <MemoryRouter>
        <MyProfile />
      </MemoryRouter>
    );
    
    expect(screen.getByPlaceholderText("Sonika")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Yeada")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("23")).toBeInTheDocument();
    expect(screen.getByText("Female")).toBeInTheDocument();
    expect(screen.getByText("Select Sports ▾")).toBeInTheDocument();
  });

  it("should allow user to enter profile details", () => {
    render(
      <MemoryRouter>
        <MyProfile />
      </MemoryRouter>
    );
    
    const firstNameInput = screen.getByPlaceholderText("Sonika");
    fireEvent.change(firstNameInput, { target: { value: "John" } });
    expect(firstNameInput.value).toBe("John");
    
    const lastNameInput = screen.getByPlaceholderText("Yeada");
    fireEvent.change(lastNameInput, { target: { value: "Doe" } });
    expect(lastNameInput.value).toBe("Doe");
    
    const ageInput = screen.getByPlaceholderText("23");
    fireEvent.change(ageInput, { target: { value: "25" } });
    expect(ageInput.value).toBe("25");
  });

  it("should allow user to select gender", () => {
    render(
      <MemoryRouter>
        <MyProfile />
      </MemoryRouter>
    );
    
    const genderSelect = screen.getByRole("combobox");
    fireEvent.change(genderSelect, { target: { value: "Male" } });
    expect(genderSelect.value).toBe("Male");
  });

  it("should open and close sports dropdown", () => {
    render(
      <MemoryRouter>
        <MyProfile />
      </MemoryRouter>
    );
    
    const dropdownButton = screen.getByText("Select Sports ▾");
    fireEvent.click(dropdownButton);
    expect(screen.getByText("Football")).toBeInTheDocument();
    
    fireEvent.click(dropdownButton);
    expect(screen.queryByText("Football")).not.toBeInTheDocument();
  });

  it("should allow user to select and deselect sports preferences", () => {
    render(
      <MemoryRouter>
        <MyProfile />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getByText("Select Sports ▾"));
    const checkbox = screen.getByLabelText("Football");
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  it("should navigate to /home when form is submitted", () => {
    render(
      <MemoryRouter>
        <MyProfile />
      </MemoryRouter>
    );
    
    const submitButton = screen.getByRole("button", { name: /Update/i });
    fireEvent.click(submitButton);
  });
});