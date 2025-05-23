package com.example.shortmeal

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.shortmeal.ui.theme.SHORTMealTheme

class Frendus : ComponentActivity() {
    var obj = ListaPrieteni()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SHORTMealTheme {
                // A surface container using the 'background' color from the theme
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {

                        obj.FriendList(listOf("Bag", "Pula", "in mortii", "tai"))
                        FloatingActionButton(onClick = {
                        // Handle click here
                        val intent = Intent(this@Frendus, Profilus::class.java)
                        startActivity(intent)
                    }) {
                        Image(
                            painter = painterResource(id = R.drawable.back_button),
                            contentDescription = null,
                            modifier = Modifier
                                .size(100.dp) // Set the size of the circle
                                .clip(CircleShape) // Clip the image to a circle
                                .border(2.dp, Color.Black, CircleShape) // Add a black border
                        )
                    }
                    }
                }
            }
        }
    }

