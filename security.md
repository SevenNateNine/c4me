### Security Measures

1. Remove all the warnings we have bc there's a lot

2. Only allow predefined domain to connect (limit cross origin requests to only certain origins)

3. SHA-512 Password Hashing + Salting

4. Sanitize all user input via regex and disallowed characters in input boxes
  - done on the backend. should report those bad results to the user

5. Add the config to the damn gitignore bc we are idiots

6. See about resolving vulnerabilities (some of which based upon certain versions of react and Node)

7. Some types of code analysis and testing
