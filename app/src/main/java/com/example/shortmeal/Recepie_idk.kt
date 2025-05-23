package com.example.shortmeal

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import coil.compose.rememberImagePainter
import com.example.shortmeal.ui.theme.SHORTMealTheme

class Recepie_idk : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val title = intent.getStringExtra("title")
        val image = intent.getStringExtra("image")
        val ingredients = intent.getStringExtra("ingredients")
        val video = intent.getStringExtra("video")
        val instruction= intent.getStringExtra("instruction")

        setContent {
            SHORTMealTheme {
                // A surface container using the 'background' color from the theme
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    Column {
                        Text(text = title.toString())
                        Text(text = ingredients.toString())
                        Text(text = video.toString())
                        if(instruction!=null){
                            Text(text = instruction.toString())
                        }
                        if (image != null) {
                            Image(
                                painter = rememberImagePainter(image),
                                contentDescription = null
                            )
                        }
                        if(video!=null){
                            Button(onClick ={
                                //Open the video
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(video))
                                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                intent.setPackage("com.google.android.youtube")
                                startActivity(intent)

                            },
                                modifier = Modifier.testTag("PlayButton")
                            ) {
                                Text("Play Video")

                            }

                        }

                    }
                }
            }
        }
    }
}