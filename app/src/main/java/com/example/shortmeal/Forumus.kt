package com.example.shortmeal

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.FloatingActionButton
import androidx.compose.material.Text
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.shortmeal.ui.theme.SHORTMealTheme
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material3.Button
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.rememberDrawerState
import androidx.compose.ui.Alignment
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.navigation.compose.rememberNavController
import com.google.accompanist.swiperefresh.SwipeRefresh
import com.google.accompanist.swiperefresh.rememberSwipeRefreshState
import kotlinx.coroutines.launch

class Forumus : ComponentActivity() {
    var obj = Short_Meal_obj()
    var a = profil()

    @Composable
    fun ForumusContent() {
        val viewModel: ForumViewModel = viewModel()
        val posts by viewModel.posts.observeAsState(initial = listOf())
        val isRefreshing = remember { mutableStateOf(false) }
        val state = rememberDrawerState(initialValue = DrawerValue.Closed)
        val scope = rememberCoroutineScope()

        viewModel.fetchPosts()
        SHORTMealTheme {
            Surface(
                modifier = Modifier.fillMaxSize(),
                color = MaterialTheme.colorScheme.background
            ) {
                Column {
                    SwipeRefresh(
                        state = rememberSwipeRefreshState(isRefreshing = isRefreshing.value),
                        onRefresh = {
                            isRefreshing.value = true
                            viewModel.fetchPosts()
                            isRefreshing.value = false
                        },
                    )
                    {

                        LazyColumn {

                            items(posts) { post ->
                                Card(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(8.dp)
                                ) {
                                    Column(
                                        modifier = Modifier.padding(16.dp)
                                    ) {

                                        Text(text = post.title)
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(text = post.content)
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Text(text = "Author: ${post.author}")
                                    }
                                }
                            }
                        }
                        Image(
                            painter = painterResource(id = R.drawable.back_button),
                            contentDescription = "Your Image",
                            modifier = Modifier
                                .size(100.dp) // Set the size of the circle
                                .clip(CircleShape) // Clip the image to a circle
                                .border(2.dp, Color.Black, CircleShape) // Add a black border
                                .clickable {
                                    // Create an Intent to start AnotherPageActivity
                                    val intent = Intent(this@Forumus, Profilus::class.java)
                                    // Start the new Activity
                                    startActivity(intent)
                                }
                        )
                    }
                    FloatingActionButton(onClick = {
                        val intent = Intent(this@Forumus, PaginaAdaugaPostare::class.java)
                        startActivity(intent)
                    }) {
                        Text("+")
                    }
                }


            }





        }
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val user_name = intent.getStringExtra("username")
        setContent {
            ForumusContent()
            if (user_name != null) {
                obj.ModalDrawerExample(
                    context = this@Forumus,
                    navController = rememberNavController(),
                    username = user_name.toString(),
                    activityContentScope = { state, scope ->
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalAlignment = Alignment.End
                        ) {
                            BackHandler(
                                enabled = state.currentValue != DrawerValue.Open,
                                onBack = {
                                    scope.launch {
                                        if (state.currentValue == DrawerValue.Open) {
                                            state.close()
                                        } else {
                                            state.open()
                                        }
                                    }
                                }
                            )
                        }
                    }
                )
            }

        }

    }
    }

