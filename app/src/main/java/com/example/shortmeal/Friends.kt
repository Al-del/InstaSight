package com.example.shortmeal

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.runtime.Composable
import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import com.example.shortmeal.R


class ListaPrieteni() {
    @Composable
    fun FriendList(friends: List<String>) {
        if (friends.isEmpty()) {
            Text("You have no friends at the moment.", modifier = Modifier.padding(16.dp))
        } else {
            LazyColumn {
                items(friends) { friend ->
                    FriendListItem(friend)
                }
            }
        }
    }

    @Composable
    fun FriendListItem(friend: String) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
        ) {
            Column {
                Image(
                    painter = painterResource(id = R.drawable.default_profile), // Replace with your image resource id
                    contentDescription = null,
                    modifier = Modifier.height(50.dp)
                        .width(50.dp)
                        .fillMaxWidth(), // Set the size of the image as needed
                    contentScale = ContentScale.Crop // Choose an appropriate contentScale for your image
                )
                Button(
                    onClick = { /* Handle click here */ },
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = friend,
                        style = MaterialTheme.typography.h6
                    )
                }
            }
        }
    }
}
/*
class FriendActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val username = intent.getStringExtra("username")
        setContent {
            FriendList(listOf(username ?: ""))
        }
    }
}
*/
