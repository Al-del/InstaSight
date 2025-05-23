package com.example.shortmeal

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.Facebook
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuDefaults.textFieldColors
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.Firebase
import com.google.firebase.database.DatabaseReference
import com.google.firebase.database.database
import androidx.compose.material3.ButtonDefaults.buttonColors
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.text.font.FontStyle

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val database = Firebase.database
            val myRef = database.getReference("Register")
            LoginScreen(myRef)
            GoToLoginText()
        }
    }
}
data class FoodPair(
    var first: String = "",
    var second: String = ""
)
data class USR(
    // on below line creating variables
    // for employee name, contact number
    // and address
    var username: String?="",
    var password: String?="",
    //List of string
    var list: List<FoodPair>?
)
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(databaseReference: DatabaseReference) {
    val username = remember { mutableStateOf("") }
    val password = remember { mutableStateOf("") }
    val passwordVisibility = remember { mutableStateOf(false) }
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column {
            Column(
                modifier = Modifier.height(150.dp), // Replace with the actual height if known
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(modifier = Modifier.weight(1f)) // Push down
                Text(
                    text = "Welcome to InstaSight",
                    style = MaterialTheme.typography.displayMedium.copy(fontStyle = FontStyle.Italic),
                    color = Color.Black,
                    modifier = Modifier
                        .padding(5.dp)
                        .offset(x = 60.dp)
                )

                Spacer(modifier = Modifier.weight(1f)) // Push up from bottom
            }

            Image(
                painter = painterResource(id = R.drawable.logo_short_meal), // replace with your logo resource
                contentDescription = "App Logo",
                modifier = Modifier.align(Alignment.CenterHorizontally)
            )

            Spacer(modifier = Modifier.height(16.dp)) // Add a spacer

            TextField(
                value = username.value,
                onValueChange = { username.value = it },
                label = { Text("Username") },
                colors = textFieldColors(Color.Magenta), // Change the color of the TextField
                modifier = Modifier.align(Alignment.CenterHorizontally) // ⬅️ Center horizontally
            )

            Spacer(modifier = Modifier.height(16.dp)) // Add a spacer

            TextField(
                value = password.value,
                onValueChange = { password.value = it },
                label = { Text("Password") },
                visualTransformation = if (passwordVisibility.value) VisualTransformation.None else PasswordVisualTransformation(),
                trailingIcon = {
                    IconButton(onClick = { passwordVisibility.value = !passwordVisibility.value }) {
                        Icon(
                            imageVector = if (passwordVisibility.value) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                            contentDescription = "Toggle password visibility"
                        )
                    }
                },
                colors = textFieldColors(Color.Magenta), // Change the color of the TextField
                modifier = Modifier.align(Alignment.CenterHorizontally) // ⬅️ Center horizontally
            )

            Spacer(modifier = Modifier.height(16.dp)) // Add a spacer

            Text(
                text = "Forgot Password",
                color = Color.Blue,
                modifier = Modifier.align(Alignment.CenterHorizontally).clickable { /* Handle forgot password here */ }
            )

            Spacer(modifier = Modifier.height(16.dp)) // Add a spacer

            Button(
                onClick = {
                    // Read from the database
                    var list: List<FoodPair>? = null
                    //add an element to the list
                    list = listOf(FoodPair("null", "nullus"))
                    var ok= USR(username.value, password.value, list)
                    val userRef = databaseReference.child(username.value)
                    userRef.setValue(ok)
                },
                modifier = Modifier
                    .height(50.dp) // Set the height of the button
                    .width(200.dp) // Set the width of the button
                    .align(Alignment.CenterHorizontally),
                colors = buttonColors(
                    containerColor = Color(0xFF004FB0) // 💙 Custom blue color
                )            ) {
                Text(
                    text = "REGISTER",
                    color = Color.White // Change the color of the text
                )
            }

            Spacer(modifier = Modifier.height(16.dp)) // Add a spacer

            Row(
                modifier = Modifier.align(Alignment.CenterHorizontally),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                Icon(imageVector = Icons.Filled.Facebook, contentDescription = "Facebook")
                Icon(imageVector = Icons.Filled.ArrowUpward, contentDescription = "Unknown")
            }
        }
    }
}
@Composable
fun GoToLoginText() {
    val context = LocalContext.current
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.BottomEnd) {
        Text(
            text = "---->",
            modifier = Modifier.clickable {
                val intent = Intent(context, Login::class.java)
                context.startActivity(intent)
            },
            color = Color.Blue,
            fontSize = 20.sp, // Increase the font size
            fontWeight = FontWeight.Bold // Make the text bold
        )
    }
}
