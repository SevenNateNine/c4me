# Backend
This is the folder for the Node.js backend server for the c4me project.

### npm install
Before beginning, please type npm install to make sure you have all the necessary dependecies installed in your node modules. This can take some time.

It consists of different files that handle the functionality of the different requests that can be made of the server
	student.js, application.js, user.js, admin.js, school.js, high_school.js
It also contains the app.js. the app.js is the main file that is run by node when running this server. it handles the
  routing of incoming requests to there respective handling function. Here I will list each of the routes and what request
  type and data they expect as well as the format of the data being returned.

  ### Requests and Queries
  GET /student/:id ~ the :id is expected to be a positive integer indecating the id of the student requested

  GET /school/:id  ~ the :id is expected to be a positive integer indecating the id of the college requested

  POST /user ~ in the body it expects json data with the following arguments and types
    
    name: The user name min length 3 max 50, tokenized
    pass: the password min length 5 max 50, alphanumaric
    type: eather 'Student' or 'Admin'
    first_name: string max 50, tokenized
    last_name: string max 50, tokenized
    email: string max 255, legal email address
      from the create account it should always be Student. we still have to deside how to create admin accounts

  PUT /student ~ in the body of the request it expects json data with the following arguments and types:	

    hs_id: integer min value 1,
    average_mark: integer [1,100],
    financial_status: integer
    major1: tokenized string max length 20,
    major2: tokenized string max length 20,
    grad_year: integer min 2000,
    sat_math: integer [200,800],
    sat_ebrw: integer [200,800],
    act_eng: integer [1,36],
    act_math: integer [1,36],
    act_reading: integer [1,36],
    act_science: integer [1,36],
    act_comp: integer [1,36],
    sat_lit: integer [1,36],
    sat_us: integer [200,800],
    sat_mathI: integer [200,800],
    sat_mathII: integer [200,800],
    sat_eco: integer [200,800],
    sat_mol: integer [200,800],
    sat_chem: integer [200,800],
    sat_phy: integer [200,800],
    numAPs: integer min 0,
    gpa: float [1.0,4.0]
  None of these values are required so you can omit any of them and the value in the db wont change.

  GET /profileImage ~ expects an id in the query data. returns the associated profile image

  POST /profileImage ~ expects the user to be logged in accepts an image named profileImage and sets the
    profile image to the profile of the logged in user.

  GET /search ~ as query arguments it expects the following values
    
    type: string of length 1; required; eather 'l' for lax or 's' for strict,
    
    admission_low: integer [0,100],	
    admission_high: integer [0, 100],
    
    cost_low: positive float
    cost_high: positive float

    states: array of strings these strings are the two letter representation of the state like NY,
    
    region: string max len 20, tokenized, ment to represent the 4 major regions in the US.
    
    rank_low: integer min val 1,	
    rank_high: integer min val 1,	
    
    size_low: integer min val 1,	
    size_high: integer min val 1,
    
    sat_math_low: integer [200,800]
    sat_math_high: integer [200, 800]
    
    sat_ebrw_low: integer [200,800]	
    sat_ebrw_high: integer [200,800]

    act_comp_low: integer [200,800], //check this	
    act_comp_high: integer [200,800],

    name: string max length 255; tolkenized.

  GET /Scrape/:src ~ not implimented yet

  GET /search/rank ~ you supply a search argument in the query which is an array of integers representing the ids
    of all the schools in the search. it will return a array of objects each one containing a id (the id of the school)
    a score and two boolean values major1 major2 both representing that weather the school offers the students major1 and
    major2 elements. the id is determined by the token in the authorization header. 

  GET /highschoolByName
    returns a list of similar high schools (name, state, city) with the same name as the searched high school

  GET /similarHS
    returns a list of all high schools that match a certain criteria (i.e., if one field is close to the searched high schools' field) and sorts them
    by how much of that criteria has been matched and how close it matches to the search high school.

  POST /application ~ for creating new Applications, has three required arguments as JSON data in the body
    college_id: positive integer
    student_id: positive integer
    status: string one of the following values: 'Pending', 'Waitlisted', 'Accepted', 'Rejected'

  PUT /application ~ same as the POST version except for updating status

  GET /application/questionableList ~ 
    returns a list of JSON objects of applications that are marked questionable 
    same format as required as input by POST /application

  GET /schoolApplications ~ gets the application tracker data for a given school
      college_id: school id (a positive int)
      hs_id: an array of highschool ids (positive ints)
      class_high: the high end of the graduating year
      class_low: the low end of the graduating year
      statuses: an array of strings ('Pending', 'Waitlisted','Accepted','Rejected')

  GET /hslist ~ returns a list of all highschools in the db

  DELETE /application ~ for deleting a specified application. Same input data as POST /application accept without status

  PUT /login ~ in the body it expects the name and password of the user it returns two values success (true or false)
    and if success is true it will inculde a token value. any protected requests will require that this value be the value
    of the authentication header. the only protected backend request is the rank.

  PUT /logout ~ disassociates the authentication header token with it's user.

  GET /validate ~ returns the user id of the user associated with the given authentiation token
    returns a 401 if theres no associated id.

  DELETE /deleteAllStudents ~ deletes all students

  GET autocomplete ~ expects two string values: type - 's' for college or 'h' for highschool, 'm' for major and 
	text - max length of 255, tokenized.
	returns a list of JSON Objects with values id and name. These are the ids and names of
	schools that have a name where the input text is a substring of that name.
