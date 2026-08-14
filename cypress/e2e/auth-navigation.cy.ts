describe("authentication navigation", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("shows the login page", () => {
    cy.visit("/login");

    cy.contains("h2", "Iniciar sesión").should("be.visible");
    cy.contains("button", "Google").should("be.visible");
  });

  it("redirects unauthenticated visitors away from transcriptions", () => {
    cy.visit("/transcriptions");

    cy.location("pathname").should("eq", "/login");
  });
});
