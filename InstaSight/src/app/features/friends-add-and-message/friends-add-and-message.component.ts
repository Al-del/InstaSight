import { Component, OnInit, OnDestroy } from '@angular/core';
import { Auth, user, signOut, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, collection, doc, getDoc, setDoc, getDocs, addDoc, query, where, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserdataService } from '../../shared/service/userdata.service';
import { SharedModule } from '../../shared/shared.module';
import { VerticalFooterComponent } from '../../shared/components/vertical-footer/vertical-footer.component';
@Component({
  selector: 'app-friends-add-and-message',
  templateUrl: './friends-add-and-message.component.html',
  styleUrls: ['./friends-add-and-message.component.scss'],
  imports : [CommonModule, FormsModule, SharedModule, VerticalFooterComponent]
})
export class FriendsAddAndMessageComponent implements OnInit, OnDestroy {
  email: string = '';
  username: string = '';
  currentUserId: string = '';
  subscription!: Subscription;

  friends: any[] = [];
  selectedFriend: any = null;
  messages: any[] = [];
  newMessage: string = '';
  friendSearchEmail: string = '';
  constructor(
    private userDataService: UserdataService,
    private auth: Auth,
    private firestore: Firestore,
    private router : Router
  ) {}

  ngOnInit() {
    this.subscription = this.userDataService.currentUserData.subscribe(data => {
      this.email = data.email;
      this.username = data.username;
  
      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          this.currentUserId = user.uid;
          await this.storeUserProfile();
          await this.loadFriends();
        } else {
          console.warn('User is not signed in');
        }
      });
    });
  }
  

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  private async storeUserProfile() {
    const userRef = doc(this.firestore, 'users', this.currentUserId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, { email: this.email, username: this.username });
    }
  }
  async loadFriends() {
    const friendsRef = collection(this.firestore, 'users', this.currentUserId, 'friends');
    const snapshot = await getDocs(friendsRef);
    this.friends = snapshot.docs.map(doc => doc.data());
  }
  
  async addFriend() {
    const searchEmail = this.friendSearchEmail.trim().toLowerCase();
    if (!searchEmail || searchEmail === this.email) {
      alert('Invalid or same email');
      return;
    }

    const q = query(collection(this.firestore, 'users'), where('email', '==', searchEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const friendDoc = snap.docs[0];
      const friendData = friendDoc.data();
      const friendUid = friendDoc.id;

      // Save friendship (both ways)
      const myFriendRef = doc(this.firestore, 'users', this.currentUserId, 'friends', friendUid);
      const theirFriendRef = doc(this.firestore, 'users', friendUid, 'friends', this.currentUserId);

      await setDoc(myFriendRef, {
        uid: friendUid,
        email: friendData["email"],
        username: friendData["username"]
      });

      await setDoc(theirFriendRef, {
        uid: this.currentUserId,
        email: this.email,
        username: this.username
      });

      this.friendSearchEmail = '';
      await this.loadFriends();
    } else {
      alert('No user found with that email');
    }
  }
  selectFriend(friend: any) {
    this.selectedFriend = friend;
    const chatId = this.getChatId(this.currentUserId, friend.uid);
    const msgRef = collection(this.firestore, 'chats', chatId, 'messages');

    onSnapshot(msgRef, snapshot => {
      this.messages = snapshot.docs
        .map(doc => doc.data())
        .sort((a, b) => (a["timestamp"]?.seconds || 0) - (b["timestamp"]?.seconds || 0));
    });
  }
  async sendMessage() {
    if (!this.newMessage.trim() || !this.selectedFriend) return;

    const chatId = this.getChatId(this.currentUserId, this.selectedFriend.uid);
    const msgRef = collection(this.firestore, 'chats', chatId, 'messages');

    await addDoc(msgRef, {
      sender: this.currentUserId,
      text: this.newMessage,
      timestamp: new Date()
    });

    this.newMessage = '';
  }
  getChatId(a: string, b: string) {
    return a < b ? `${a}_${b}` : `${b}_${a}`;
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(["/"]);
  }
  
}