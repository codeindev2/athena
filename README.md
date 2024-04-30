# athenasis + RBAC

This project contains all the necessary boilerplate to setup a multi-tenant SaaS with Next.js including authentication and RBAC authorization.

## Features

### Authentication

- [x] It should be able to authenticate using e-mail & password;
- [x] It should be able to authenticate using Github account;
- [x] It should be able to recover password using e-mail;
- [x] It should be able to create an account (e-mail, name and password);

### Business

- [x] It should be able to create a new business;
- [x] It should be able to get business to which the user belongs;
- [x] It should be able to update an business;
- [x] It should be able to shutdown an business;
- [x] It should be able to transfer business ownership;



### Clients

- [ ] It should be able to get business clients;
- [ ] It should be able to update a member role;

### Products

- [x] It should be able to get products within a business;
- [x] It should be able to create a new product (name, url, description);
- [x] It should be able to update a product (name, url, description);
- [x] It should be able to delete a product;

### Services

- [ ] It should be able to get services within a business;
- [ ] It should be able to create a new service (name, url, description);
- [ ] It should be able to update a service (name, url, description);
- [ ] It should be able to delete a service;

### Schedules

- [ ] It should be able to get schedules within a business and member;
- [ ] It should be able to create a new schedule (name, url, description);
- [ ] It should be able to update a schedule (name, url, description);
- [ ] It should be able to delete a schedule;
### Billing

- [ ] It should be able to get billing details for business ($20 per project / $10 per member excluding billing role);

## RBAC

Roles & permissions.

### Roles

- Owner (count as administrator)
- Administrator
- Member
- Billing (one per business)
- Anonymous

### Permissions table

|                          | Administrator | Member | Billing | Anonymous |
| ------------------------ | ------------- | ------ | ------- | --------- |
| Update business      | ✅            | ❌     | ❌      | ❌        |
| Delete business      | ✅            | ❌     | ❌      | ❌        |
| Invite a member          | ✅            | ❌     | ❌      | ❌        |
| Revoke an invite         | ✅            | ❌     | ❌      | ❌        |
| List members             | ✅            | ✅     | ✅      | ❌        |
| Transfer ownership       | ⚠️             | ❌     | ❌      | ❌        |
| Update member role       | ✅            | ❌     | ❌      | ❌        |
| Delete member            | ✅            | ⚠️      | ❌      | ❌        |
| List projects            | ✅            | ✅     | ✅      | ❌        |
| Create a new project     | ✅            | ✅     | ❌      | ❌        |
| Update a project         | ✅            | ⚠️      | ❌      | ❌        |
| Delete a project         | ✅            | ⚠️      | ❌      | ❌        |
| Get billing details      | ✅            | ❌     | ✅      | ❌        |
| Export billing details   | ✅            | ❌     | ✅      | ❌        |

> ✅ = allowed
> ❌ = not allowed
> ⚠️ = allowed w/ conditions

#### Conditions

- Only owners may transfer business ownership;
- Only administrators and project authors may update/delete the project;
- Members can leave their own business;