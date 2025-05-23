package com.example.shortmeal

import android.content.ContentValues.TAG
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text

import androidx.compose.ui.tooling.preview.Preview
import com.example.shortmeal.ui.theme.SHORTMealTheme
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.material3.ButtonDefaults.buttonColors
import androidx.compose.material3.ExposedDropdownMenuDefaults.textFieldColors
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.google.firebase.Firebase
import com.google.firebase.database.*
import kotlinx.coroutines.launch

 class a {
    var title: String = ""
    var continut:String =  ""
    var author: String = ""

}

class PaginaAdaugaPostare : ComponentActivity() {
    var obj = ForumViewModel()
    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SHORTMealTheme {
                // A surface container using the 'background' color from the theme
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    Column( horizontalAlignment =  Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center) {
                        val title = remember { mutableStateOf("") }
                        val content = remember { mutableStateOf("") }
                        val author = remember { mutableStateOf("") }

                        TextField(
                            value = title.value,
                            onValueChange = { newValue -> title.value = newValue },
                            label = { Text("Title") },
                            colors = textFieldColors(Color(0xFF90FFDC))
                        )

                        TextField(
                            value = content.value,
                            onValueChange = { newValue -> content.value = newValue },
                            label = { Text("Content") },
                            colors = textFieldColors(Color(0xFF90FFDC))
                        )

                        TextField(
                            value = author.value,
                            onValueChange = { newValue -> author.value = newValue },
                            label = { Text("Author") },
                            colors = textFieldColors(Color(0xFF90FFDC))
                        )

                        Button(onClick = {
                            obj.addPost(title.value, content.value, author.value)
                            finish() // This will close the current activity and return to the previous one
                        }) {
                            Text("Submit Post")
                        }
                    }
                }
            }
        }
    }
}