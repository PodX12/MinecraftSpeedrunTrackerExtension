<template>
    <div>
        <label>User Key</label>
        <p>The user key is given the first time you run the MinecraftSpeedrunTracker console app. Downloadable <a
                href="">here</a></p>
        <input type="text" v-model="userKey" placeholder="Your user key" />
        <button @click="save()">Save</button>
        <div>{{ savedMessage }}</div>
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

            this.savedMessage = "Key Updated";
        }
    }
}
</script>

<style scoped>
* {
    font-family: "Roobert", "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
}
div{
    background-color: #18181b;
    color: #efeff1;
}
a{
    color: red;
}

label {
    font-weight: bold;
}

input[type=text] {
    display: block;
    width: 400px;
    padding: 5px;
}

button {
    margin-top: 10px;
    width: 400px;
    text-transform: uppercase;
    font-weight: bold;
}
</style>