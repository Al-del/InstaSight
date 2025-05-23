package com.example.shortmeal

import android.content.ContentValues.TAG
import android.util.Log
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.text.font.FontWeight
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.compose.runtime.livedata.observeAsState
import androidx.lifecycle.asLiveData
import com.google.firebase.Firebase
import com.google.firebase.firestore.firestore
import com.example.shortmeal.ForumPost

data class ForumPost(
    val id: String = "",
    var title: String = "",
    var content: String = "",
    var author: String = "",
    val createdAt: Long = System.currentTimeMillis()
)

class ForumViewModel : ViewModel() {
    private val _posts = MutableLiveData<List<ForumPost>>()
    val posts: LiveData<List<ForumPost>> = _posts

    private val db = Firebase.firestore

    fun fetchPosts() {
        db.collection("posts")
            .get()
            .addOnSuccessListener { result ->
                val posts = result.map { document ->
                    document.toObject(ForumPost::class.java)
                }
                _posts.value = posts
            }
    }

    fun addPost(title: String, content: String, author: String) {
        val newPost = ForumPost(title = title, content = content, author = author)

        db.collection("posts")
            .add(newPost)
            .addOnSuccessListener { documentReference ->
                fetchPosts()
            }
    }
}

@Composable
fun ForumScreen(viewModel: ForumViewModel) {
    val posts by viewModel.posts.observeAsState(initial = emptyList())

    Column {
        NewPostForm(viewModel)
        LazyColumn {
            items(posts, key = { it.id }) { post ->
                PostCard(post)
            }
        }
    }
}

@Composable
fun PostCard(post: ForumPost) {
    Card {
        Column {
            Text(text = post.title, fontWeight = FontWeight.Bold)
            Text(text = post.content)
            Text(text = "Posted by: ${post.author}")
        }
    }
}

@Composable
fun NewPostForm(viewModel: ForumViewModel) {
    var title by remember { mutableStateOf("") }
    var content by remember { mutableStateOf("") }
    var author by remember { mutableStateOf("") }

    Column {
        TextField(
            value = title,
            onValueChange = { newValue: String -> title = newValue },
            label = { Text("Title") })
        TextField(
            value = content,
            onValueChange = { newValue: String -> content = newValue },
            label = { Text("Content") })
        TextField(
            value = author,
            onValueChange = { newValue: String -> author = newValue },
            label = { Text("Author") })
        Button(onClick = { viewModel.addPost(title, content, author) }) {
            Text("Post")
        }
    }
}