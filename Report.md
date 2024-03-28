# Report for Assignment 2 - API Design in 1DV027 - The Web as an Application Platform by Jimmy Karlsson <jk224jv@student.lnu.se>

## Introduction

This report is a summary of the work done in the second assignment of the course 1DV527 - The Web as an Application Platform.  
The assignment was about designing an API for a web application. The API should be able to handle CRUD operations for a resource.  
I chose to design and create an API for personal budgeting and expense tracking.  

The user should be able to create, read, update and delete a budget with a custom set of categories.  
The user should also be able to create, read, update and delete expenses for any of the categories in the budget.  
The user should be able to add other users to the budget with either read or write permissions.

## Initial TechStack Choices

I chose to use Typescript, Node.js with Express.js as the server framework for the API...  
my initial thoughts were to build a NextJs fullstack application as that would give me a very quick access to a frontend without having to build a separate frontend application or deal with any view engines.  
However, I decided to go with Express from a tactical standpoint as this would allow me to recycle a lot of code.  
Seeing how design and documentation was a big part of the assignment, reducing the amount of code to write would be beneficial.

For the database I chose to use MongoDB as it is a NoSQL database. Since I want the users to be able to create their own categories for their budget,  
a NoSQL database would be a good fit as it allows for more flexibility in the data structure.  
While this could also be solved with a SQL database, it would require quite a bit of normalization and would be more complex to work with since the categories will be nested in the budget.  
Also, a document database like MongoDB means less parsing and transforming of data when working with the API.  
A downside will be that the budget object/record will become larger as the user adds more expenses and keep growing over time, but I think that is a reasonable tradeoff.  
In a real-world scenario, this could be mitigated by archiving old budgets and expenses, but for this assignment it will not be a problem.

Authentication will be handled with JWT tokens. While my fist thought was to have an OAuth2 server, that would require some sort of frontend to handle the login flow, and I wanted to keep the API as a standalone service.  
Consequently, a simple username and password login will be used to get a JWT token that will be used to authenticate the user for the API.  
Every request that is not to the login or register endpoints will require a valid JWT token in the Authorization header.  

## Design

The API is designed to be RESTful and uses the HTTP methods GET, POST, PUT and DELETE to handle the CRUD operations.  
The API is versioned and the version is included in the URL.  
The API is designed to be stateless and all data is stored in the database.  
The API is designed to be secure and all requests par login and registration require a valid JWT token in the Authorization header.  

The API is designed hierarchically with the budget as the root resource, a budget in turn has categories and those categories have expenses.

## Report questions

### 1. Explain and defend your implementation of HATEOAS in your solution

HATEOAS is an acronym for Hypermedia As The Engine Of Application State.  
The idea is that the API should be self-descriptive and that the client should be able to navigate the API by following links in the response.  
I personally think that this is not a very good idea as it carries a significant overhead and complexity, paired with a significant risk of breaking the versioning contract.  
While theoretically the concept allows you to build a very dumb client that can navigate the API without any prior knowledge,  
in practice you still need to make the assumption that not every client will be HATEOAS compliant, and thus provided you have a public API you still need to honor the versioning contract,  
and the theoretical benefits of HATEOAS are lost... you simply end up with doing the routing for the client in the backend instead of the frontend.  
On the assumption that you are the only consumer of the API, the theory holds up, but it is not very clean.

That being said, I have implemented a form of HATEOAS in the API.  
When a user logs in, the response will include a link to get the budgets the user have access to.  
When budgets are fetched, the response will include a link to each available budget resource.  
When a budget is fetched, the response will include a link to CRUD actions for that resource, and link get to the categories in the budget.  
When a category is fetched, the response will include a link to CRUD actions for that resource, and link get to the expenses in the category.  
When an expense is fetched, the response will include a link to CRUD actions for that resource.
Every step also includes a link to the parent resource, so that the client can navigate back up the hierarchy, and a logout link.

The links follows the standard format { rel: string, href: string, method: string } where rel is the relation of the link, href is the URL of the resource and method is the HTTP method to use.  
e.g. { rel: 'self', href: '/api/v1/budgets/123', method: 'GET' }, { rel: 'back', href: '/api/v1/budgets', method: 'GET' }, { rel: 'create', href: '/api/v1/budgets/123/categories', method: 'POST' }  
This is not much in the way of a defense of the implementation, it follows the standard even though I don't think it is a very good idea the customer is always right.  

### 2. If your solution should implement multiple representations of the resources. How would you do it?

The requirements only specify that the API should be able to handle JSON, and that is the only representation that is implemented...  
However, if the API should be able to handle multiple representations, there are a few ways to do it. But basically, you would need to look at the Accept header in the request and respond with the appropriate representation.  
Unless you want to have completely different routes for different representations, you would need to have some sort of middleware that can transform the response to the requested representation.  
I think I would put this in the controller, as the controller is responsible for the response and then have that call the appropriate middleware.  
It should not need to be more complex then having a switch statement that checks the Accept header and then sets the response type and content accordingly before returning the response to the controller that sends it to the client.

### 3. Motivate and defend your authentication solution

The authentication solution is a simple username and password login that returns a JWT token. It's easy to implement and easy to use.  
The passwords are hashed and salted before being stored in the database, and the JWT token is signed with a secret key.  
In a teroritical sense, I can in later development add OAuth2 or some other authentication and then return the JWT token from that, and the rest of the API would not need to change.  
I chose to use JWT tokens since they are self-contained, verifiable, and can be used to authenticate the user without having to look up the user in the database for every request.  
I also don't need to use any cookies, which is a plus in this case since the API may be used by a client that is not a web browser.

These things put together is why I chose to use JWT tokens for authentication.

### 3a. What other authentication solutions could you implement?

As mentioned, I could implement OAuth2. This would allow the user to log in with their Google or Facebook account, and I would not need to store any passwords.  
The only reson I did not implement this is that it would require a frontend to handle the login flow, and I wanted to keep the API as a standalone service.

### 3b. What are the pros/cons of this solution?

The pros of this solution is that it is easy to implement and easy to use.  
JWT tokens are generally considered secure, and is tamper proofed.

The cons of this solution is that it is only a username and password login,  
a password is only as secure as the user makes it, and the user may use the same password for multiple services.  
also the password is stored in the database, and while it is hashed and salted, it is still a potential security risk.  
The JWT token is also a potential security risk, as it needs to be stored somewhere client side, and if the client is compromised, the token can be stolen.

### 4. Explain how your webhook works

When an expense is created or updated, the webhook will check if the conditions are met, and if they are, it will send a POST request to the URL specified in the webhook with the expense.
The webhook is designed to be stateless and will not store any data, it will only send a POST request to the URL specified in the webhook and then forget about it.


### 5. Since this is your first own web API, there are probably things you would solve in another way, looking back at this assignment. Write your thoughts about this.

It isn't my first API... I think its my 4th or 5th API, but it is the first pure API of this size and complexity... the previous APIs have been part of a larger application, or feeding a frontend from a backend, and have been more focused on the business logic and less on the API design.

I started out by writing a quite thorough design document in Swagger that gave me a good overview of the API and how it would work... this may have been a bit wasteful, but it did give me a good initial overview.  

### 6. Which "linguistic design rules" have you implemented? List them here and motivate "for each" of them very briefly why did you choose them? Remember that you must consider "at least" FIVE "linguistic design rules" as the linguistic quality of your API.

  1. Forward slash for hierarchical relationships... I chose this because it is the standard for hierarchical relationships in URLs.  
  And its a very clear way to show that the resource is a child of another resource, in short I like it and it makes sense.  
  Don't know what else there is to say about that.

  2. A trailing forward slash should not be used.
  I mean... of course it should not be used. You are trying to access a resource, not a directory.

  3. Hyphens should be used to improve readability.
  I use this once... there is only a single route that is complex enough to need a hyphen, but I think it makes it more readable... not everyone is blessed with the ability to read camelCase effortlessly.

  4. Underscores should not be used.
  Yes, I agree... I never liked underscores in URLs, they are hard to read especially when used in hrefs in HTML they disappear completely in the underline.

  5. Lowercase letters should be used.
  YES! Simple... you don't have to reach for the shift key, and you don't have to remember if you used a capital letter or not... it's just easier and less error prone.

  6. File extensions should not be used in the URI.
  Agreed... way to error prone, and it's not a file, it's a resource.

  7. A singular noun should be used for a resource name.
  Of course... it's a single resource, not a collection of resources... it's a budget, not a budgets.  
  I am probably to used to oop but this is just common sense.

  8. A plural noun should be used for a collection of resources.
  Yes, of course... it's a collection of resources, not a single resource... it's budgets, not a budget.  
  I fail to see how you can have rule 7 without rule 8, so they go together.

### 7. Did you do something extra besides the fundamental requirements? Explain them.

I followed most of the linguistic design rules not just five... not sure if that counts as extra since the linguistic design rules are fairly fundamental.  
My API is considerably bigger then the fundamental requirements.  
My API have an additional webhook above the required one.