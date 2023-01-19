<template>
    <div class="full-height">
        <div class="aa-overlay" :class="{ 'hide': !isShowing }">
            <div class="aa-main">
                <div class="title">
                    All Advancements
                </div>
                <div class="adv-grid" :class="{ 'hide': view != 'advancements' }">
                    <div v-if="completeCount == totalCount">
                        <h2 style="text-align: center; text-shadow: 2px 2px #000;">
                            LETS GO! <br />
                            All Advancements Completed<br />
                            <span style="color: #fff">Final Time: {{ msToTime(record.final_igt) }}</span>
                        </h2>
                    </div>

                    <div>
                        <div v-for="sub in subGoals" :key="sub.id" class="adv-item" :class="{ 'done': sub.complete }">
                            <div class="adv-img sub" @mouseover="hoverAdv = sub" @mouseleave="hoverAdv = null">
                                <div v-bind:class="[sub.class]"></div>
                                <div class="adv-count" v-if="sub.total">
                                    {{ sub.count }}/{{ sub.total }}
                                </div>
                            </div>
                            <div class="adv-title">
                                {{ sub.newName ? sub.newName : sub.name }}
                            </div>
                        </div>
                        <div class="clear"></div>
                    </div>

                    <div class="adv-title" v-if="completeCount < totalCount || !hideCompleted">Advancements</div>
                    <div v-for="g in model.groups" :key="g.id">
                        <div v-for="adv in g.advancements" class="adv-item" :key="adv.id" :class="{
                            'done': adv.complete,
                            'challenge': adv.type == 'challenge',
                            'goal': adv.type == 'goal',
                            'hide': adv.complete && hideCompleted
                        }">
                            <div class="adv-img" @mouseover="hoverAdv = adv" @mouseleave="hoverAdv = null">
                                <div v-bind:class="[adv.class]"></div>
                                <div class="adv-count" v-if="adv.criteria">
                                    {{ adv.completedCriteria }}/{{ adv.criteria.criterion.length }}
                                </div>
                            </div>
                            <div class="adv-title">
                                {{ adv.name }}
                            </div>
                        </div>
                    </div>
                    <div class="clear"></div>
                </div>

                <div class="adv-grid" :class="{ 'hide': view != 'splits' }">
                    <div v-for="split in splits" :key="split.name" class="split">
                        <div class="split-name">
                            {{ split.name }}
                        </div>
                        <div class="split-diff">
                            {{ split.diff ? "+" + msToTime(split.diff) : "" }}
                        </div>
                        <div class="split-time">
                            {{ msToTime(split.igt) }}
                        </div>
                    </div>
                </div>

                <div class="action-list">
                    <div class="action-wrap" @click="view = 'advancements'" :class="{ 'hide': view == 'advancements' }">
                        <div class="action">
                            Advancements
                        </div>
                    </div>
                    <div class="action-wrap" :class="{ 'hide': view == 'splits' }">
                        <div class="action" :class="{ 'on': !hideCompleted }" @click="hideCompleted = !hideCompleted">
                            {{ hideCompleted? "Show": "Hide" }} Completed
                        </div>
                    </div>
                    <div class="action-wrap" @click="view = 'splits'" :class="{ 'hide': view == 'splits' }">
                        <div class="action">
                            Splits
                        </div>
                    </div>
                </div>
            </div>
            <div class="summary" @click="isShowing = !isShowing">
                <div class="summary-item">
                    <div class='item-display'>
                        {{ completeCount }}<div class="break"></div>{{ totalCount }}
                    </div>
                </div>
                <div class="summary-item">
                    <div class='item-display show-more'>
                        {{ isShowing? 'Show Less': 'Show More' }}
                    </div>
                </div>
            </div>
            <div class="adv-hover" v-if="hoverAdv">
                <div class="hover-header">
                    <div class="adv-img">
                        <div v-bind:class="[hoverAdv.class]"></div>
                    </div>
                    <div class="hover-name">{{ hoverAdv.name }}</div>
                </div>
                <div class="hover-description">
                    {{ hoverAdv.description }}
                </div>
                <div class="hover-explanation" v-if="hoverAdv.explanation">
                    How To:<br /> {{ hoverAdv.explanation }}
                </div>
                <div class="hover-criteria" v-if="hoverAdv.criteria">
                    <div v-for="crit in hoverAdv.criteria.criterion" class="criteria" :key="crit.id"
                        :class="{ 'done': crit.complete }" v-show="!crit.complete || !hideCompleted">
                        <span class="icon" :class="crit.class"></span> {{ crit.name }}
                    </div>
                    <div class="clear"></div>
                </div>
                <div v-if="hoverAdv.splits">
                    <div v-for="split in hoverAdv.splits" :key="split.id" class="criteria">
                        <span class="icon" :class="split.class"></span>
                        {{ split.name }} <span style="color: #fff">{{ split.time }}</span>
                    </div>
                    <div class="clear"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import firebase from '../firebase/firebase';
import advjson from "../assets/adv.json"
import subGoals from "../assets/sub-goals.json"

//TEST RECORDS
//import testRecord from "../assets/pound-record.json"
import testRecord from "../assets/dylqn-record.json"
//import testRecord from "../assets/danny-record.json"

var database = firebase.database();

export default {
    name: 'VideoOverlay',
    data() {
        return {
            view: "advancements",
            isShowing: false,
            model: {},
            record: {},
            completeCount: 0,
            totalCount: 0,
            advancements: {},
            hideCompleted: true,
            hoverAdv: null,
            userKey: "",
            subGoals: subGoals,
            splits: []
        }
    },
    mounted() {
        var that = this;

        this.model = advjson;

        this.totalCount = 0;
        this.model.groups.forEach(g => {
            this.totalCount += g.advancements.length;
        });

        if (process.env.NODE_ENV == "development") {
            this.record = testRecord;
            this.updateRecord();
            return;
        }


        var twitch = window.Twitch.ext;
        twitch.configuration.onChanged(function () {
            if (twitch.configuration.broadcaster) {
                try {
                    var config = JSON.parse(twitch.configuration.broadcaster.content);
                    that.userKey = config.userKey;

                    var userKey = config.userKey;
                    var streamerRef = database.ref(`records/${userKey}`);

                    streamerRef.on('value', (snapshot) => {
                        const data = snapshot.val();
                        that.record = JSON.parse(data.record);

                        that.updateRecord();
                    });
                }
                catch (e) {
                    console.log(e);
                }
            }
        });

    },
    methods: {
        updateRecord: function () {
            var that = this;

            //Check if valid file
            if (!that.model.groups) {
                console.log("No model groups found");
                return;
            }

            //Reset complete value of all advancements
            that.completeCount = 0;
            that.subGoals = subGoals;
            that.model.groups.forEach(g => {
                g.advancements.forEach(a => {
                    a.complete = false;
                    a.completedCriteria = 0;
                })
            });

            //Set advancement states
            for (let adv in that.record.advancements) {
                var advancement = that.record.advancements[adv];
                if (advancement.is_advancement
                    && advancement.complete) {
                    that.completeCount++;
                }

                that.model.groups.forEach(g => {
                    g.advancements.forEach(a => {
                        if (a.id == adv) {
                            if (a.criteria) {
                                a.criteria.criterion.forEach(crit => {
                                    crit.complete = false;

                                    //loop through record criteria
                                    for (let iCrit in advancement.criteria) {
                                        if (crit.id == iCrit) {
                                            crit.complete = true;
                                            a.completedCriteria++;
                                        }
                                    }
                                });
                            }

                            if (advancement.complete) {
                                a.complete = true;
                            }
                        }
                    })
                });
            }

            that.updateSubGoals();

            that.updateSplits();
        },
        getStat: function (section, item) {
            if (!this.record.stats)
                return 0;

            var pId = Object.keys(this.record.stats)[0];
            if (this.record.stats[pId]) {
                if (this.record.stats[pId].stats[section]) {
                    if (this.record.stats[pId].stats[section][item]) {
                        return this.record.stats[pId].stats[section][item];
                    }
                }
            }

            return 0;
        },
        msToTime: function (duration) {
            var milliseconds = Math.floor((duration % 1000) / 100),
                seconds = Math.floor((duration / 1000) % 60),
                minutes = Math.floor((duration / (1000 * 60)) % 60),
                hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

            hours = (hours < 10) ? "0" + hours : hours;
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;

            if (minutes == "00" && hours == "00")
                return `${seconds}.${milliseconds}`;

            if (hours == "00") {
                return `${minutes}:${seconds}.${milliseconds}`;
            }

            return `${hours}:${minutes}:${seconds}.${milliseconds}`;
        },
        updateSubGoals: function () {
            var that = this;

            that.subGoals.forEach(g => {
                //Reset counts
                g.count = 0;
                g.newName = "";
                g.complete = false;

                if (g.id == "minecraft:rare_biomes") {
                    var completedBiomeCount = 0;

                    var jungleBiomeCount = 0, badlandsBiomeCount = 0, mushroomBiomeCount = 0, snowyBiomeCount = 0, giantTreeBiomeCount = 0;
                    g.splits.forEach(s => {
                        var runSplit = that.record.advancements["minecraft:adventure/adventuring_time"].criteria[s.id];
                        s.time = "";
                        if (runSplit) {
                            s.time = that.msToTime(runSplit.igt);

                            if (s.group == "jungle") {
                                jungleBiomeCount++;
                            }
                            if (s.group == "snowy")
                                snowyBiomeCount++;
                            if (s.group == "badlands")
                                badlandsBiomeCount++;
                            if (s.group == "mushroom")
                                mushroomBiomeCount++;
                            if (s.group == "giant_tree_taiga") {
                                giantTreeBiomeCount++;
                            }
                        }
                    });

                    if (jungleBiomeCount == 5) { completedBiomeCount++; }
                    if (badlandsBiomeCount == 3) { completedBiomeCount++; }
                    if (mushroomBiomeCount == 2) { completedBiomeCount++; }
                    if (snowyBiomeCount == 5) { completedBiomeCount++; }
                    if (giantTreeBiomeCount == 2) { completedBiomeCount++; }

                    g.count = completedBiomeCount;
                    g.complete = g.count >= g.total;
                    return;
                }

                if (g.id == "minecraft:enchanted_golden_apple") {
                    var gap = that.record.advancements["minecraft:recipes/misc/mojang_banner_pattern"];
                    if (gap) {
                        g.complete = gap.complete;
                        if (!g.splits) g.splits = [];
                        g.splits.splice(0);
                        g.splits = [{
                            "id": "minecraft:enchanted_golden_apple",
                            "name": "God Apple",
                            "class": "enchanted_golden_apple",
                            "time": that.msToTime(gap.igt)
                        }];
                        g.newName = "Obtained God Apple";
                    }
                    return;
                }

                if (g.id == "minecraft:wither_skeleton_skull") {
                    g.count = that.getStat(g.parent, g.id);
                    g.killCount = that.getStat("minecraft:killed", g.id);
                    if (!g.splits)
                        g.splits = [];
                    g.splits.splice(0);
                    g.splits = [{
                        "id": "minecraft:wither_skeleton",
                        "name": `Wither Skeletons Killed: ${that.getStat("minecraft:killed", "minecraft:wither_skeleton")}`,
                        "class": "wither_skeleton"
                    }
                    ];

                    if (that.record.timelines.find(t => t.name == "kill_wither")) {
                        g.complete = true;
                        g.newName = "Killed Wither";
                    }
                    return;
                }

                if (g.id == "minecraft:trident") {
                    g.count = that.getStat(g.parent, g.id);
                    if (!g.splits)
                        g.splits = [];
                    g.splits.splice(0);
                    g.splits = [{
                        "id": "minecraft:drowned",
                        "name": `Drowned Killed: ${that.getStat("minecraft:killed", "minecraft:drowned")}`,
                        "class": "drowned"
                    }
                    ];

                    if (g.count >= g.total) {
                        g.newName = "Obtained Trident";

                        var vvf = that.record.advancements["minecraft:adventure/very_very_frightening"];
                        if (vvf) {
                            g.complete = vvf.complete;
                            g.newName = "VVF Complete";
                        }

                        if (!g.splits) g.splits = [];
                        var trident = that.record.timelines.find(t => t.name == "got_trident");
                        g.splits.push({
                            "id": "minecraft:trident",
                            "name": "Trident",
                            "class": "trident",
                            "time": that.msToTime(trident.igt)
                        });
                    }

                    return;
                }

                if (g.id == "minecraft:nautilus_shell") {
                    g.count = that.getStat(g.parent, g.id);
                    // g.splits.splice(0);
                    // var shellCount = 1;
                    // that.record.timelines.forEach(t => {
                    //     if (t.name.includes("got_shell_")) {
                    //         g.splits.push({
                    //             "id": t.name,
                    //             "name": `Shell ${shellCount++}`,
                    //             "class": "egg",
                    //             "time": that.msToTime(t.igt)
                    //         });
                    //     }
                    // });

                    g.complete = g.count >= g.total;
                    return;
                }

                if (g.id == "minecraft:bee_nest") {
                    g.count = that.getStat(g.parent, g.id);

                    var beeLocation = that.record.advancements["minecraft:husbandry/silk_touch_nest"];
                    if (beeLocation && beeLocation.complete) {
                        g.complete = g.count >= g.total;
                    }
                    return;
                }

                if (g.id == "minecraft:hdm") {
                    var twoByTwo = that.record.advancements["minecraft:husbandry/bred_all_animals"];

                    if (twoByTwo &&
                        twoByTwo.criteria["minecraft:donkey"] &&
                        twoByTwo.criteria["minecraft:horse"] &&
                        twoByTwo.criteria["minecraft:mule"])
                        g.complete = true;

                    return;
                }

                g.count = that.getStat(g.parent, g.id);
                g.complete = g.count >= g.total;
            });
        },
        updateSplits: function () {
            var that = this;
            var splits = [];

            /*******Any%******/
            that.addTimelineToSplits(splits, "Enter Nether", "enter_nether");
            that.addTimelineToSplits(splits, "Enter Bastion", "enter_bastion");
            that.addTimelineToSplits(splits, "Enter Fortress", "enter_fortress");
            that.addTimelineToSplits(splits, "First Portal", "nether_travel");
            that.addTimelineToSplits(splits, "Eye Spy", "enter_stronghold");
            that.addTimelineToSplits(splits, "Enter End", "enter_end");
            that.addTimelineToSplits(splits, "Kill Dragon", "kill_ender_dragon");

            /*******END BUSTING********/
            that.addAdvancementToSplits(splits, "Obtain Elytra", "minecraft:end/elytra");
            //TODO: 4 Shulker Shells
            //TODO: Shulker Transport
            //TODO: Leave End

            /*******Enchanting & Fishing********/
            //TODO: Obtained Lapis
            that.addAdvancementToSplits(splits, "Start Enchanting", "minecraft:story/enchant_item");
            //TODO: Collecting Fish 5 fish

            /*******MID GAME********/
            that.addAdvancementToSplits(splits, "Adventuring Time", "minecraft:adventure/adventuring_time");
            //TODO: Each Rare Biomes
            that.addAdvancementToSplits(splits, "Zombie Doctor", "minecraft:story/cure_zombie_villager");
            that.addAdvancementToSplits(splits, "Complete Catlogue", "minecraft:husbandry/complete_catalogue");
            that.addAdvancementToSplits(splits, "Uneasy Alliance", "minecraft:nether/uneasy_alliance");
            that.addTimelineToSplits(splits, "Obtain Trident", "got_trident");
            that.addTimelineToSplits(splits, "Obtain 8 Shells", "got_shell_8");
            //TODO: Obtain 164 gold
            //TODO: Skulls Completed (need time)

            var twoByTwo = this.record.advancements["minecraft:husbandry/bred_all_animals"];
            if (twoByTwo) {
                var hdm = { "name": "Breed Donkey/Mule", "igt": 0, "rta": 0 }
                if (twoByTwo.criteria["minecraft:donkey"]) {
                    hdm.igt = twoByTwo.criteria["minecraft:donkey"].igt;
                    hdm.rta = twoByTwo.criteria["minecraft:donkey"].rta;
                }
                if (twoByTwo.criteria["minecraft:mule"] &&
                    twoByTwo.criteria["minecraft:mule"].igt > twoByTwo.criteria["minecraft:donkey"].igt) {
                    hdm.igt = twoByTwo.criteria["minecraft:mule"].igt;
                    hdm.rta = twoByTwo.criteria["minecraft:mule"].rta;
                }
                splits.push(hdm);

                if (twoByTwo.criteria["minecraft:panda"]) {
                    splits.push({ "name": "Breed Pandas", "igt": twoByTwo.criteria["minecraft:panda"].igt, "rta": twoByTwo.criteria["minecraft:panda"].rta });
                }
            }

            /*******END GAME********/
            that.addAdvancementToSplits(splits, "Cover Me in Debris", "minecraft:nether/netherite_armor");
            that.addAdvancementToSplits(splits, "Beaconator", "minecraft:nether/create_full_beacon");
            that.addAdvancementToSplits(splits, "Voluntary Exile", "minecraft:adventure/voluntary_exile");
            that.addAdvancementToSplits(splits, "Hero of the Village", "minecraft:adventure/hero_of_the_village");
            that.addAdvancementToSplits(splits, "How Did We Get Here?", "minecraft:nether/all_effects");

            var monstersHunter = this.record.advancements["minecraft:adventure/kill_all_mobs"];
            if (monstersHunter) {
                if (monstersHunter.criteria["minecraft:wither"])
                    splits.push({ "name": "Kill Wither", igt: monstersHunter.criteria["minecraft:wither"].igt, rta: monstersHunter.criteria["minecraft:wither"].rta });
            }

            //All Advancements Complete
            if (that.record.is_completed) {
                splits.push({ "name": "All Advancements", igt: that.record.final_igt, rta: that.record.final_rta });
            }

            splits.sort((a, b) => a.igt < b.igt ? -1 : 1);

            for (var i = 1; i < splits.length; i++) {
                var split = splits[i];
                var preSplit = splits[i - 1];
                split.diff = split.igt - preSplit.igt;
            }

            this.splits = splits;
        },
        addTimelineToSplits: function (splits, name, timelineName) {
            var timeline = this.record.timelines.find(t => t.name == timelineName);
            if (timeline)
                return splits.push({ "name": name, "igt": timeline.igt, "rta": timeline.rta });
        },
        addAdvancementToSplits: function (splits, name, advName) {
            var adv = this.record.advancements[advName];
            if (adv && adv.complete)
                return splits.push({ "name": name, "igt": adv.igt, "rta": adv.rta });
        }
    }
}
</script>