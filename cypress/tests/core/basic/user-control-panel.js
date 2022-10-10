// const interceptUsers = () => {
//   cy.intercept({
//     method: 'GET',
//     url: '**/usergroup',
//   }).as('manyUsers');
//   cy.visit('/controlpanel/users');
//   cy.waitForResourceToLoad('@navigation');
//   cy.waitForResourceToLoad('@breadcrumbs');
//   cy.waitForResourceToLoad('@actions');
//   cy.waitForResourceToLoad('@types');
// };

describe('User Control Panel Test', () => {
  beforeEach(() => {
    // given a logged in editor
    // and a folder that contains a document
    // and the folder contents view
    cy.visit('/');
    cy.autologin();
  });
  it('Should add User to controlPanel', () => {
    cy.visit('/controlpanel/users');
    cy.waitForResourceToLoad('@navigation');
    cy.waitForResourceToLoad('@breadcrumbs');
    cy.waitForResourceToLoad('@actions');
    cy.waitForResourceToLoad('@types');
    // when I added a user from controlPanel
    cy.get('Button[id="toolbar-add"]').click();
    cy.get('input[id="field-username"]').clear().type('iFlameing');
    cy.get('input[id="field-fullname"]').clear().type('Alok Kumar');
    cy.get('input[id ="field-email"]').clear().type('info@example.com');
    cy.get('input[id="field-password"]').clear().type('test@test');
    cy.get('button[title="Save"]').click(-50, -50, { force: true });

    // then the user section must contains a fullname when I searched the
    // same with the same username
    cy.get('input[id="user-search-input"]').clear().type('i');
    cy.get('.icon.button:first').click();
    cy.get('.fullname').should('have.text', 'Alok Kumar');
  });

  it('Should show error from backend when add User fails', () => {
    cy.intercept('POST', '**/@users', {
      statusCode: 400,
      body: {
        error: {
          message: 'Error from backend.',
        },
      },
    }).as('saveUser');
    cy.visit('/controlpanel/users');
    // when I added a user from controlPanel
    cy.get('Button[id="toolbar-add"]').click();
    cy.get('input[id="field-username"]').clear().type('iFlameing');
    cy.get('input[id="field-fullname"]').clear().type('Alok Kumar');
    cy.get('input[id ="field-email"]').clear().type('info@example.com');
    cy.get('input[id="field-password"]').clear().type('test@test');
    cy.get('button[title="Save"]').click(-50, -50, { force: true });
    cy.wait('@saveUser').then((intercepted) => {
      cy.contains(intercepted.response.body.error.message);
    });
  });

  it('Should view user info from controlPanel', () => {
    const userFullName = 'Test Example';
    const userEmail = 'info@example.com';

    cy.visit('/controlpanel/users');
    cy.waitForResourceToLoad('@navigation');
    cy.waitForResourceToLoad('@breadcrumbs');
    cy.waitForResourceToLoad('@actions');
    cy.waitForResourceToLoad('@types');
    cy.waitForResourceToLoad('@users');

    //add a user first
    cy.get('Button[id="toolbar-add"]').click();
    cy.get('input[id="field-username"]').clear().type('example');
    cy.get('input[id="field-fullname"]').clear().type(userFullName);
    cy.get('input[id ="field-email"]').clear().type(userEmail);
    cy.get('input[id="field-password"]').clear().type(userEmail);
    cy.get('button[title="Save"]').click(-50, -50, { force: true });

    cy.waitForResourceToLoad('@users');
    cy.get('tr:nth-of-type(2) > td.fullname').should('have.text', userFullName);
    cy.get('tr:nth-of-type(2) div[role="listbox"]').click();
    cy.waitForResourceToLoad('@users');
    cy.get('.menu.visible').within(() => {
      cy.findByRole('option', { name: /view user info/gi }).click();
    });
    cy.waitForResourceToLoad('@userschema');
    cy.waitForResourceToLoad('/personal-information/example');
    cy.findByText(/Test Example/gi).should('be.visible');
  });

  it('Should delete User from controlPanel', () => {
    cy.visit('/controlpanel/users');
    cy.waitForResourceToLoad('@navigation');
    cy.waitForResourceToLoad('@breadcrumbs');
    cy.waitForResourceToLoad('@actions');
    cy.waitForResourceToLoad('@types');
    cy.waitForResourceToLoad('@users');

    //add a user first
    cy.get('Button[id="toolbar-add"]').click();
    cy.get('input[id="field-username"]').clear().type('iFlameing');
    cy.get('input[id="field-fullname"]').clear().type('Alok Kumar');
    cy.get('input[id ="field-email"]').clear().type('info@example.com');
    cy.get('input[id="field-password"]').clear().type('test@test');
    cy.get('button[title="Save"]').click(-50, -50, { force: true });

    // select first user with name, delete it and search if its exists or not!
    cy.get('tr:nth-of-type(2) > td.fullname').should('have.text', 'Alok Kumar');
    cy.get('tr:nth-of-type(2) div[role="listbox"]').click();
    cy.get('.menu.visible').within(() => {
      cy.findByRole('option', { text: /delete/gi }).click();
    });
    cy.contains('Delete User');
    cy.get('button.ui.primary.button').should('have.text', 'OK').click();
    cy.get('input[id="user-search-input"]').clear().type('i');
    cy.get('.icon.button:first').click();
    cy.getIfExists('.fullname').should('not.have.text', 'Alok Kumar');
  });

  it('Should update user roles', () => {
    cy.visit('/controlpanel/users');
    cy.waitForResourceToLoad('@navigation');
    cy.waitForResourceToLoad('@breadcrumbs');
    cy.waitForResourceToLoad('@actions');
    cy.waitForResourceToLoad('@types');

    cy.get('[data-user="users"] input[type="checkbox"')
      .first()
      .check({ force: true });

    cy.get('Button[id="toolbar-save"]').click();

    cy.reload();

    cy.get('[data-user="users"] div.checkbox')
      .first()
      .should('have.class', 'checked');
  });
});
describe('User Control Panel test for  many users', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.autologin();
    cy.createUser({
      username: 'editor',
      fullname: 'Peet Editor',
    });
    cy.visit('/controlpanel/usergroup');
    cy.waitForResourceToLoad('@navigation');
    cy.waitForResourceToLoad('@breadcrumbs');

    cy.get('.content-area').then(($content_area) => {
      if ($content_area.text().indexOf('Settings') > -1) {
        cy.get('input[name="field-many_groups"]').check({
          force: true,
        });
        cy.get('input[name="field-many_users"]').check({
          force: true,
        });
        cy.get('#toolbar-save').click();
      }
    });
  });
  afterEach(() => {
    // not many users, not many groups
    cy.visit('/controlpanel/usergroup');
    cy.waitForResourceToLoad('@navigation');
    cy.waitForResourceToLoad('@breadcrumbs');

    cy.get('.content-area').then(($content_area) => {
      if ($content_area.text().indexOf('Settings') > -1) {
        cy.get('input[name="field-many_groups"]').check({
          force: true,
        });
        cy.get('input[name="field-many_users"]').check({
          force: true,
        });
        cy.get('#toolbar-save').click();
      }
    });
  });
  // it('Should not show users if the many_users option in enabled', () => {
  //   interceptUsers();
  //   cy.wait('@manyUsers').then((interception) => {
  //     if (expect(interception.response.body.data.many_users).to.equal(true)) {
  //       cy.get('.ui.secondary.attached.menu div.menu').should('be.empty');
  //     }
  //   });
  // });
  // it('In the case of many users, It should show a user only when it is searched by a username ', () => {
  //   interceptUsers();
  //   cy.wait('@manyUsers').then((interception) => {
  //     if (expect(interception.response.body.data.many_users).to.equal(true)) {
  //       cy.get('input[id="user-search-input"]').clear().type('editor');
  //       cy.get('.icon.button:first').click();
  //       cy.get('.fullname').should('have.text', 'Peet Editor');
  //     }
  //   });
  // });
});
