const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const app = express();
const ObjectId = require('mongodb')
app.use(cors({ origin: '*' }));
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
mongoose.connect('mongodb+srv://raunakriya:raunakcluster@cluster0.klgs2a1.mongodb.net/User_Data?retryWrites=true&w=majority')
const db = mongoose.connection;

// error
db.on('error', console.error.bind(console, 'error connecting to db'));

// up and running then print the message
db.once('open', function () {
  console.log("successfully connected to database!");
});
const users = db.collection('users');
// Define a schema and model for your MongoDB documents
const User = mongoose.model('User', {
  username: String,
  password: String,
  email: String,
});



// Middleware to parse JSON
app.use(express.json());

// Define API routes
app.get('/getUser', async (req, res) => {
  // Implement your GET endpoint logic here
  try {
    const users = await User.find();
    return res.status(200).json({
      users: users,
      msg: 'user got successfully'
    })
  } catch (err) {
    return res.status(500).json({ error: err })
  }
});

app.post('/createUser', async (req, res) => {
  // Implement your POST endpoint logic here

  try {
    const { username, password, email } = req.body;
   
    // Validate input
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Create a new user
    const newUser = new User({ username, password, email });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.post('/login', async (req, res) => {
  try {
 
    const { username, password } = req.body;
    

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    
    const user = await users.findOne({ username, password });



    // Check if the user exists
    if (user) {
      console.log("Login successful")
      res.send({ message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/updateUser/:id', async (req, res) => {
  const userId = req.params.id;
  const updatedUserData = req.body;
 
  try {
    const result = await User.updateOne(
      { _id: { $eq: userId } },
      { $set: updatedUserData }
    );

    if (result.matchedCount === 1) {
      res.status(200).json({ message: 'User updated successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

app.delete('/deleteUser/:id', async (req, res) => {
  try {
    const userId = req.params.id
    let deletedData = await User.findOneAndDelete({ _id: userId  })

      res.status(200).json({deletedData:deletedData, message: 'User deleted successfully' });
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

app.get('/getUser/:id', async (req, res) => {
  try {
    const userId = req.params.id
    let UsergetById = await User.findById({ _id: userId })
  
      res.status(200).json({UsergetById:UsergetById, message: 'User got successfully' });
   
  } catch (error) {
   console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
