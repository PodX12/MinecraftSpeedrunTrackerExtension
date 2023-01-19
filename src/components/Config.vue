<template>
    <div>
        <label>How To Set Up:</label>
        <p>Video Guide: <a href="#">youtube.com/video</a></p>
        <ol>
            <li>Download the console application from: https://github.com/PodX12/MinecraftSpeedrunTrackerConsole/releases</li>
            <li>Run MinecraftSpeedrunTracker.exe and copy your User Key. Run this everytime you are speedrunning.</li>
            <li>Enter your User Key below and save.</li>
        </ol>

        <label>User Key</label>
        <input type="text" v-model="userKey" placeholder="Your user key" />
        <div class="save-button">
            <span class="save-msg">{{ savedMessage }}</span>
            <button @click="save()">Save</button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            token: null,
            userId: null,
            twitch: null,
            userKey: "",
            savedMessage: ""
        }
    },
    mounted() {
        this.twitch = window.Twitch.ext;

        this.twitch.onContext((context) => {
            this.twitch.rig.log(context);
        });

        this.twitch.onAuthorized((auth) => {
            this.token = auth.token;
            this.userId = auth.userId;
            if (this.twitch.configuration.broadcaster) {
                try{
                    var config = JSON.parse(this.twitch.configuration.broadcaster.content);
                    this.userKey = config.userKey;
                }
                catch (e){
                    console.log(e);
                }
            }
        });

        this.twitch.onError((err) =>{
            console.log(err);
        })
    },
    methods: {
        save(){
            var configString = `{ "userKey": "${this.userKey}" }`;
            this.twitch.configuration.set('broadcaster', '1', configString);
            this.savedMessage = "User Key Update!";
            var that = this;
            setTimeout( () => { that.savedMessage = ""; }, 5000)
        }
    }
}
</script>

<style scoped>
* {
    font-family: "Roobert", "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 1.3rem;
}
div{
    background-color: #18181b;
    color: #efeff1;
}
p{
    margin: 5px auto;
}
a{
    color: red;
}

label {
    margin-bottom: 5px;
    display: block;
}

input[type=text] {
    box-sizing: border-box;
    display: block;
    width: 100%;
    padding: 7px 10px;
    background-color: rgba(0,0,0,0);
    border: 1px solid #ccc;
    border-radius: 4px;
}
.save-button{
    text-align: right;
}
button {
    margin: 10px 0;
    padding: 7px 30px;
    background-color: #0d6efd;
    border: 1px solid #0d6efd;
    color: #fff;
    border-radius: 4px;
}
.save-msg{
    color: rgb(25,135,84);
    padding-right: 5px;
}
</style>