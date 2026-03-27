# Postman Integration Guide

This guide explains how to test the Student & Movie Records API using Postman and how to add custom JavaScript.

## Installation

1. Download and install [Postman](https://www.postman.com/downloads/)
2. Open Postman

## Setting Up the Environment

### Step 1: Create a New Collection
1. Click "Collections" in the left sidebar
2. Click "+ Create Collection"
3. Name it "Student Movie API"
4. Click "Create"

### Step 2: Create Environment Variables (Optional but Recommended)
1. Click the settings icon (⚙️) on the top right
2. Go to "Environments"
3. Click "+ Create Environment"
4. Name it "Local Dev"
5. Add variable:
   - **Variable**: `base_url`
   - **Initial Value**: `http://localhost:5000`
   - **Current Value**: `http://localhost:5000`
6. Click "Save"
7. Select this environment from the dropdown (top right)

## Testing Student Endpoints

### 1. GET All Students
- **Method**: GET
- **URL**: `{{base_url}}/students` or `http://localhost:5000/students`
- **Click**: Send
- **Expected Response** (Status 200):
```json
[
  {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "grade": "A"
  }
]
```

### 2. GET Specific Student
- **Method**: GET
- **URL**: `{{base_url}}/students/1`
- **Click**: Send

### 3. POST Create New Student
- **Method**: POST
- **URL**: `{{base_url}}/students`
- **Headers Tab**:
  - Key: `Content-Type`
  - Value: `application/json`
- **Body Tab**: Select "raw" and "JSON"
- **Body**:
```json
{
  "name": "David Lee",
  "email": "david@example.com",
  "grade": "A+"
}
```
- **Click**: Send
- **Expected Response** (Status 201):
```json
{
  "id": 4,
  "name": "David Lee",
  "email": "david@example.com",
  "grade": "A+"
}
```

### 4. PUT Update Student
- **Method**: PUT
- **URL**: `{{base_url}}/students/1`
- **Headers**: Content-Type: application/json
- **Body**:
```json
{
  "name": "Alice Smith",
  "email": "alice.smith@example.com",
  "grade": "A+"
}
```
- **Click**: Send

### 5. DELETE Student
- **Method**: DELETE
- **URL**: `{{base_url}}/students/1`
- **Click**: Send
- **Expected Response** (Status 200): Returns the deleted student

## Testing Movie Endpoints

### 1. GET All Movies
- **Method**: GET
- **URL**: `{{base_url}}/movies`
- **Click**: Send

### 2. GET Movies with Rating Filter
- **Method**: GET
- **URL**: `{{base_url}}/movies?rating=4`
- **Click**: Send

### 3. POST Create New Movie
- **Method**: POST
- **URL**: `{{base_url}}/movies`
- **Headers**: Content-Type: application/json
- **Body**:
```json
{
  "title": "Avatar",
  "genre": "Sci-Fi",
  "rating": 5,
  "recommendation": "Yes"
}
```
- **Click**: Send

### 4. PATCH Update Movie (Partial Update)
- **Method**: PATCH
- **URL**: `{{base_url}}/movies/1`
- **Headers**: Content-Type: application/json
- **Body** (only update fields you want to change):
```json
{
  "recommendation": "No",
  "rating": 4
}
```
- **Click**: Send

### 5. DELETE Movie
- **Method**: DELETE
- **URL**: `{{base_url}}/movies/5`
- **Click**: Send

## Adding Custom JavaScript in Postman

Postman allows you to write custom JavaScript in "Pre-request Script" and "Tests" tabs to automate and validate API requests.

### Pre-request Script (Runs Before Request)

You can set variables, generate tokens, or manipulate request data before sending.

**Example 1: Set Dynamic Timestamp**

1. Create a GET request to `/students`
2. Go to "Pre-request Script" tab
3. Add this code:
```javascript
// Set a timestamp variable
pm.environment.set("timestamp", new Date().toISOString());
console.log("Request sent at: " + pm.environment.get("timestamp"));
```
4. Send the request
5. Check the console (View → Show Postman Console)

**Example 2: Generate Sequential IDs**

```javascript
// Generate a random ID for testing
let randomId = Math.floor(Math.random() * 10000);
pm.environment.set("randomId", randomId);
console.log("Generated ID: " + randomId);
```

**Example 3: Create Dynamic Request Body**

```javascript
// Create a student object with dynamic data
let studentData = {
  name: "Student_" + Date.now(),
  email: "student_" + Date.now() + "@example.com",
  grade: "A"
};

// Set it as a variable to use in Body
pm.environment.set("studentData", JSON.stringify(studentData));
```

Then in the Body (raw JSON), use:
```
{{studentData}}
```

### Tests Tab (Runs After Response)

Write assertions to validate the response.

**Example 1: Check Status Code**

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```

**Example 2: Check Response Structure**

```javascript
pm.test("Response contains students array", function () {
    let jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
});
```

**Example 3: Validate Student Data**

```javascript
pm.test("Student has required fields", function () {
    let jsonData = pm.response.json();
    pm.expect(jsonData[0]).to.have.property('id');
    pm.expect(jsonData[0]).to.have.property('name');
    pm.expect(jsonData[0]).to.have.property('email');
    pm.expect(jsonData[0]).to.have.property('grade');
});
```

**Example 4: Check Movie Rating Filter**

```javascript
pm.test("All returned movies have rating 4", function () {
    let jsonData = pm.response.json();
    jsonData.forEach(function(movie) {
        pm.expect(movie.rating).to.equal(4);
    });
});
```

**Example 5: Save Response Data for Later Use**

```javascript
pm.test("Save first student ID for later requests", function () {
    let jsonData = pm.response.json();
    let firstStudentId = jsonData[0].id;
    pm.environment.set("studentId", firstStudentId);
    console.log("Saved Student ID: " + firstStudentId);
});
```

**Example 6: Validate Response Time**

```javascript
pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
```

**Example 7: Chain Multiple Requests**

After creating a student (POST /students), save the ID:

```javascript
pm.test("Student created successfully", function () {
    pm.response.to.have.status(201);
    let jsonData = pm.response.json();
    pm.environment.set("createdStudentId", jsonData.id);
    console.log("Created student with ID: " + jsonData.id);
});
```

Then create another request:
- **Method**: GET
- **URL**: `{{base_url}}/students/{{createdStudentId}}`
- This will use the ID from the previous request!

## Complete Workflow Example

Here's a complete workflow using JavaScript to automate testing:

### Request 1: Create a Student
```
POST {{base_url}}/students

Pre-request Script:
pm.environment.set("newStudentName", "John_" + Date.now());

Body (raw JSON):
{
  "name": "{{newStudentName}}",
  "email": "john@example.com",
  "grade": "A"
}

Tests:
pm.test("Student created", function () {
    pm.response.to.have.status(201);
    pm.environment.set("studentId", pm.response.json().id);
});
```

### Request 2: Get the Created Student
```
GET {{base_url}}/students/{{studentId}}

Tests:
pm.test("Student retrieved", function () {
    pm.response.to.have.status(200);
    pm.expect(pm.response.json().name).to.equal(pm.environment.get("newStudentName"));
});
```

### Request 3: Update the Student
```
PUT {{base_url}}/students/{{studentId}}

Body (raw JSON):
{
  "name": "{{newStudentName}}",
  "email": "john.updated@example.com",
  "grade": "A+"
}

Tests:
pm.test("Student updated", function () {
    pm.response.to.have.status(200);
});
```

## Useful Postman JavaScript APIs

```javascript
// Get variable
pm.environment.get("variableName");
pm.globals.get("variableName");

// Set variable
pm.environment.set("variableName", value);
pm.globals.set("variableName", value);

// Clear variable
pm.environment.unset("variableName");

// Get response
let jsonData = pm.response.json();
let jsonText = pm.response.text();

// Test status
pm.response.to.have.status(200);

// Test body
pm.expect(pm.response.json()).to.be.an('array');

// Log to console
console.log("Message");

// Parse and validate
JSON.parse(string);
JSON.stringify(object);
```

## Tips

- ✅ Always set `Content-Type: application/json` header for POST/PATCH/PUT requests
- ✅ Use environment variables ({{variable_name}}) for base URL and IDs
- ✅ Use Pre-request Scripts to set up data before requests
- ✅ Use Tests to validate and chain requests together
- ✅ Check the console (View → Show Postman Console) to see console.log output
- ✅ Use "Save Response" to inspect full response data

---

Now you can fully test and automate your API testing in Postman! 🚀
