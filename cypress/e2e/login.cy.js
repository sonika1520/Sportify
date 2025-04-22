describe("Login Page Tests", () => {
    beforeEach(() => {
      cy.visit("http://localhost:3000/login"); // Adjust URL if necessary
    });
  
    it("should load the login page successfully", () => {
      cy.contains("Sign in").should("be.visible");
      cy.contains("SPORT!FY").should("be.visible");
    });
  
    it("should allow user to enter email and password", () => {
      cy.get("input[type='email']").type("sonika@example.com").should("have.value", "sonika@example.com");
      cy.get("input[type='password']").type("Sonika@123").should("have.value", "Sonika@123");
    });
  
    it("should navigate to home page on login button click", () => {
      cy.get("input[type='email']").type("sonika@example.com");
      cy.get("input[type='password']").type("Sonika@123");
      cy.get(".login-button").click();
      cy.window().then((win) => {
        cy.stub(win, 'alert').callsFake((msg) => {
          expect(msg).to.equal("Login successful!");
        });
      });
      cy.wait(1000);
      cy.url().should("include", "/Home");
      cy.wait(1000);
      
    });
  
    it("should navigate to register page on 'Click here' click", () => {
      cy.contains("Click here").click();
      cy.url().should("include", "/register");
      cy.wait(1000);
    });
  
    it("should navigate to forgot password page on 'Forgot password' click", () => {
      cy.contains("Forgot password?").click();
      cy.url().should("include", "/forgotpass");
      cy.wait(1000);
    });
  });


  describe("profile pagetest", () => {
    beforeEach(() => {
      cy.visit("http://localhost:3000/login"); 
      cy.get("input[type='email']").type("sonika@example.com");
      cy.get("input[type='password']").type("Sonika@123");
      cy.get(".login-button").click();
      cy.window().then((win) => {
        cy.stub(win, 'alert').callsFake((msg) => {
          expect(msg).to.equal("Login successful!");
        });
      });
      cy.wait(1000);
      cy.url().should("include", "/Home");
      // // Adjust URL if necessary
    });
    // Adjust URL if necessary
    

    it("should navigate to my profile page when 'Profile' button is clicked", () => {
      cy.get("button").contains("Profile").click();
      cy.contains("Profile").should("exist");
      cy.contains("Age").should("exist");
      cy.contains("Gender").should("exist");
      cy.contains("Sports").should("exist");
      cy.wait(1000);
      cy.get("button").contains("Joined Events").click();
      cy.wait(1000);
      cy.get("button").contains("Created Events").click();
      cy.wait(1000);

    });
    
    
  });

  describe("create event page test", () => {
    beforeEach(() => {
      cy.visit("http://localhost:3000/login");
      cy.get("input[type='email']").type("sonika@example.com");
      cy.get("input[type='password']").type("Sonika@123");
      cy.get(".login-button").click();
      cy.window().then((win) => {
        cy.stub(win, 'alert').callsFake((msg) => {
          expect(msg).to.equal("Login successful!");
        });
      });
      cy.wait(1000);
      cy.url().should("include", "/Home");
    }); 

    it("should navigate to create event page when 'Create Event' button is clicked", () => {
      cy.get("button").contains("+").click();
      cy.contains("Create Event").should("exist");
      cy.wait(1000);
      cy.get("input[id='title']").type("ggg").should("have.value", "ggg");
      cy.get("textarea[id='description']").type("ggg").should("have.value", "ggg");
      cy.get("input[id='event_date']").type("2017-06-01T08:30");
      cy.get("input[id='location-input']").type("ben hill");
      cy.get("input[id='max_players']").type("10").should("have.value", "10");
      cy.get("select[id='sport']").get("option[value='Basketball']");
      cy.get("button[type='submit']").click();

      cy.wait(1000);
    });
    
  });   

  describe("Main Page Tests", () => {
    beforeEach(() => {
      cy.visit("http://localhost:3000/Main"); // Adjust URL if necessary
      
    });

    it("should render the navigation bar correctly", () => {
      cy.contains("SPORT!FY").should("exist");
      cy.get("button").contains("Home").should("exist");
      cy.get("button").contains("Contact").should("exist");
      cy.get("button").contains("Log In").should("exist");
      cy.get("button").contains("Get Started").should("exist");
    });
  
    it("should navigate to Login when 'Log In' button is clicked", () => {
      cy.get("button").contains("Log In").click();
    });
  
    it("should navigate to Register when 'Get Started' button is clicked", () => {
      cy.get("button").contains("Get Started").click();
    });
  
    it("should navigate to Register when 'GET STARTED' button in the body is clicked", () => {
      cy.get("button#but5").click();
    });
  
  });

  describe("Register Page Tests", () => {
    beforeEach(() => {
      cy.visit("http://localhost:3000/register");
    });
    it("should render the Register page correctly", () => {
      cy.contains("Sign Up").should("be.visible");
      cy.get("input[placeholder='Enter your email']").should("exist");
      cy.get("input[placeholder='Enter your password']").should("exist");
      cy.get("input[placeholder='Confirm your password']").should("exist");
      cy.contains("Register").should("be.visible");
    });
  
    it("should allow user to type in email, password, and confirm password", () => {
      cy.get("input[placeholder='Enter your email']").type("test@example.com");
      cy.get("input[placeholder='Enter your password']").type("Test@123");
      cy.get("input[placeholder='Confirm your password']").type("Test@123");
  
      cy.get("input[placeholder='Enter your email']").should("have.value", "test@example.com");
      cy.get("input[placeholder='Enter your password']").should("have.value", "Test@123");
      cy.get("input[placeholder='Confirm your password']").should("have.value", "Test@123");
    });
  
    it("should show validation error for invalid email", () => {
      cy.get("input[placeholder='Enter your email']").type("invalidemail");
      cy.get("div").contains("⚠️ Please enter a valid email address.").should("be.visible");
    });
  
    it("should show validation error for weak password", () => {
      cy.get("input[placeholder='Enter your password']").type("weakpass");
      cy.get("div").contains("⚠️ Password must be at least 8 characters").should("be.visible");
    });
  
    it("should show error when passwords do not match", () => {
      cy.get("input[placeholder='Enter your password']").type("Test@123");
      cy.get("input[placeholder='Confirm your password']").type("WrongPass");
      cy.get("div").contains("⚠️ Passwords do not match.").should("be.visible");
    });
    
    
  });


  