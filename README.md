# University-Management-System

Our final project for CS 546

To run:

```
npm start
```

.env

```
mongoServerUrl="URL pointing to your mongodb instance"
CookieSecret="A random string that helps keep session cookies secure"
SMTPServerURL="The url pointing to your SMTP server"
SMTPPort=465
SMTPUsername="Username"
SMTPPassword="Password"
MailServerDomain="The domain from which your emails will be sent"
SiteDomain="The url from which the site can be accessed"
UnixCompat=True on Unix based systems
```

Note on UnixCompat:
The module we are using for pdf generation has compatibility issues with Unix based systems. Setting UnixCompat to true will allow the module to operate on these systems.
