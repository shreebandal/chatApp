let myTemp = ""
function onloading(){
    if(document.getElementById('mail').innerHTML === "12345@gmail.com"){
        document.getElementById('userlog').innerHTML = `
        <div class="col">
            <button type="button" onclick="signInWithGoogle()"
                class="btn btn-lg btn-block
                btn-basic d-flex
                align-items-center">
                Sign in With Google
                <span class="fab fa-google ml-auto"></span>
            </button>
        </div>
        `       
    } else {
        document.getElementById('userlog').innerHTML = `
        <div class="col">
            <button type="button" onclick="signOut()"
                class="btn btn-lg btn-block
                btn-basic d-flex
                align-items-center">
                Log Out
                <span class="fa fa-sign-out-alt ml-auto"></span>
            </button>
        </div>
        `
    }
}

function signInWithGoogle(){
    let provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithPopup(provider)

    setTimeout(()=>{
        location.replace('HomePage.html?theme='+theme)
    },30000)
}

function onfirebaseSateChange(){
    firebase.auth().onAuthStateChanged(onStateChange)
}

function onStateChange(user){
    if(user){
        //alert(firebase.auth().currentUser.email + '\n' + firebase.auth().currentUser.displayName)
        let flag = false
        let db = firebase.database().ref('users')

        let today = new Date()
        let date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear()
        let time = ""
        let temp = ""

        if(today.getHours()>12){
            time = (today.getHours()-12) + ":" + today.getMinutes()
            temp = "PM"
        } 
        else {
            time = today.getHours() + ":" + today.getMinutes() 
            temp = "AM"
        }

        db.on('value' , (users)=>{
            users.forEach((data)=>{
                let user = data.val()
                if(user.email === firebase.auth().currentUser.email)
                    flag = true
            })
            if(flag === false){
                let userProfile = { bio : "" , email : "" , name : "" , photoURL : "" }
                
                userProfile.email = firebase.auth().currentUser.email
                userProfile.name = firebase.auth().currentUser.displayName
                userProfile.photoURL = firebase.auth().currentUser.photoURL


                firebase.database().ref('users').push(userProfile, callback)
            }
        })

        let db1 = firebase.database().ref('users')
                    db1.on('value' , (users)=>{
                        users.forEach((data)=>{
                            let user = data.val()
                            if(user.email === firebase.auth().currentUser.email)
                                myTemp = data.key
                        })
                    })

                    setTimeout(()=>{
                        const messaging = firebase.messaging();
                        messaging.requestPermission().then(()=>{
                            return messaging.getToken();
                        }).then((token)=>{
                            firebase.database().ref('fcmTokens').child(myTemp).set({token_id : token})
                        })
                    },5000)
                    
        document.getElementById('pic').src = firebase.auth().currentUser.photoURL
        document.getElementById('name').innerHTML = firebase.auth().currentUser.displayName
        document.getElementById('mail').innerHTML = firebase.auth().currentUser.email 
        document.getElementById('Date').innerHTML = date
        document.getElementById('Time').innerHTML = time + " " + temp
        document.getElementById('userlog').innerHTML = `
        <div class="col">
            <button type="button" onclick="signOut()"
                class="btn btn-lg btn-block
                btn-basic d-flex
                align-items-center">
                Log Out
                <span class="fa fa-sign-out-alt ml-auto"></span>
            </button>
        </div>
        `
        requestPending()

    }
    else{
        document.getElementById('pic').src = 'images/profile.jpg'
        document.getElementById('name').innerHTML = 'Your Name'
        document.getElementById('mail').innerHTML = '12345@gmail.com'
        document.getElementById('Date').innerHTML = "dd-mm-yy"
        document.getElementById('Time').innerHTML = "H:M"
    }
}

function callback(error){
    if(error){
        alert(error)
    }
}

function signOut(){
    let database = firebase.database().ref('users')
        database.on('value' , (users)=>{
            users.forEach((data)=>{
                let user = data.val()
                if(user.email === firebase.auth().currentUser.email)
                    firebase.database().ref('users').child(data.key).update({ bio : user.bio , email : user.email , name : user.name , photoURL : user.photoURL , lastseen : new Date().toLocaleString() })
            })
        })

    firebase.auth().signOut()
    location.replace('HomePage.html?theme='+theme)
}

onfirebaseSateChange()

function changeData(){
    let db = firebase.database().ref('users')
    db.on('value' , (users)=>{
        users.forEach((data)=>{
            let user = data.val()
            if(user.email === firebase.auth().currentUser.email){
                let userProfile = { bio : user.bio , email : user.email , name : user.name , photoURL : user.photoURL }
                userProfile.name = document.getElementById('profile-name').value
                userProfile.bio = document.getElementById('profile-about').value

                firebase.database().ref('users/'+data.key).update(userProfile)
            }
            document.getElementById('profile-name').innerHTML = ""
            document.getElementById('profile-about').innerHTML = ""
        })
    })
}

function sendRequest(){
    if(document.getElementById('mail').innerHTML !== "12345@gmail.com"){
        let db = firebase.database().ref('users')
        let flag = false
        db.on('value' , (users)=>{
            users.forEach((data)=>{
                let user = data.val()
                if(user.email === document.getElementById('invite-email').value)
                    flag = true
            })
        })
        if(document.getElementById('mail').innerHTML === document.getElementById('invite-email').value){
            alert("you can't send friend request to you")    
        }
        else if(flag === true){
                let dataBase = firebase.database().ref('notification')
                let temp = false
                dataBase.on('value' , (users)=>{
                    users.forEach((data)=>{
                        let user = data.val()
                        if((user.sendFrom === document.getElementById('mail').innerHTML && user.sendTo === document.getElementById('invite-email').value) || (user.sendTo === document.getElementById('mail').innerHTML && user.sendFrom === document.getElementById('invite-email').value))
                            temp = true
                    })
                })
                if(temp === false){
                    let dataBases = firebase.database().ref('friends')
                    let mytemp = false
                    dataBases.on('value' , (users)=>{
                        users.forEach((data)=>{
                            let user = data.val()
                            if((user.me === document.getElementById('mail').innerHTML && user.you === document.getElementById('invite-email').value) || (user.you === document.getElementById('mail').innerHTML && user.me === document.getElementById('invite-email').value))
                                mytemp = true
                        })
                    if(mytemp === false){
                    let notify = { sendTo : "" , sendFrom : "" , sendName : "" , sendPic : "" , sendMsg : "" }

                    notify.sendTo = document.getElementById('invite-email').value
                    notify.sendFrom = document.getElementById('mail').innerHTML
                    notify.sendName = document.getElementById('name').innerHTML
                    notify.sendPic = document.getElementById('pic').src
                    notify.sendMsg = document.getElementById('invite-message').value
            
                    firebase.database().ref('notification').push(notify,callback)

                    location.replace('HomePage.html?theme='+theme)
                    }
                    else{
                        alert("you already friend to these user")
                    }
                })
                }
                else{
                    alert("Request is pending")
                }
            }
            else{
                alert("your friend is not register yet")
            }      
    }
    else{
        alert("for sending request you need to login first")
    }
}

function requestPending(){
    if(document.getElementById('mail').innerHTML !== "12345@gmail.com"){
        let db = firebase.database().ref('notification')

        db.orderByChild('sendTo').equalTo(document.getElementById('mail').innerHTML).on('value',(notify)=>{
            document.getElementById('totalrequests').innerHTML = notify.numChildren()
        })
    }
}

function showRequestList(){
    if(document.getElementById('mail').innerHTML !== "12345@gmail.com"){
        let db = firebase.database().ref('notification')

        db.on('value' , (users)=>{
            users.forEach((data)=>{
                let user = data.val()
                if(user.sendTo === document.getElementById('mail').innerHTML){                    
            document.getElementById('showRequests').innerHTML += `
            <div class="card mb-6">
                                            <div class="card-body">

                                                <div class="media">

                                                    <div class="avatar
                                                        avatar-online mr-5">
                                                        <img class="avatar-img"
                                                            src="${user.sendPic}">
                                                    </div>


                                                    <div class="media-body
                                                        align-self-center">
                                                        <h6 class="mb-0">${user.sendName}</h6>
                                                        <small
                                                            class="text-muted" id="mymail">${user.sendFrom}</small>
                                                    </div>

                                                    <div
                                                        class="align-self-center
                                                        ml-5">
                                                        <div class="dropdown
                                                            z-index-max">
                                                            <a href="#"
                                                                class="btn
                                                                btn-sm btn-ico
                                                                btn-link
                                                                text-muted
                                                                w-auto"
                                                                data-toggle="dropdown"
                                                                aria-haspopup="true"
                                                                aria-expanded="false">
                                                                <i class="fa
                                                                    fa-ellipsis-v"></i>
                                                            </a>
                                                            <div
                                                                class="dropdown-menu">
                                                                <a
                                                                    class="dropdown-item
                                                                    d-flex
                                                                    align-items-center"
                                                                    href="#" onclick="makeChat('${data.key}','${user.sendFrom}')">
                                                                    New chat
                                                                    <span
                                                                        class="ml-auto
                                                                        fa
                                                                        fa-pen"></span>
                                                                </a>
                                                                <a
                                                                    class="dropdown-item
                                                                    d-flex
                                                                    align-items-center"
                                                                    href="#" onclick="deleteRequest('${data.key}')">
                                                                    Delete <span
                                                                        class="ml-auto
                                                                        fa
                                                                        fa-trash"></span>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
            `
                }
        })
    })
    }
}

function makeChat(user,usermail){
    let db = firebase.database().ref('notification/'+user)

    let myfriends = { me : document.getElementById('mail').innerHTML , you : usermail }
    firebase.database().ref('friends').push(myfriends,callback)

    db.remove()
    location.replace('HomePage.html?theme='+theme)
}

function deleteRequest(user){
    let db = firebase.database().ref('notification/'+user)
    db.remove()
    location.replace('HomePage.html?theme='+theme)
}





