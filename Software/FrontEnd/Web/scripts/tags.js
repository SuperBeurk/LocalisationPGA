const apiUrl = "http://localhost:80/"

window.addEventListener("DOMContentLoaded", e => {
    const tagsNode = [];
    const beaconsNode = [];
    const tagsActive = [];
    let selectedFilter = null;
    var N320Length = 11.3;
    var N320Width = 11;
    var N319Length;
    var N319Width;

    let intervalLiveTracking;

    let stringToColour = function (str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var colour = '#';
        for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 0xFF;
            colour += ('00' + value.toString(16)).substr(-2);
        }
        return colour;
    }

    $(document).ready(function () {
        $('#selectTags').select2();
        $('#selectBeacons').select2();
        $('#selectTags').on("select2:select", function (e) {
//            tagsNode[parseInt(e.params.data.id)].style.visibility = "visible";
            tagsActive.push(parseInt(e.params.data.id));

            if (selectedFilter === 1) {

            }
        });
        $('#selectTags').on("select2:unselect", function (e) {
            tagsNode[parseInt(e.params.data.id)].style.visibility = "hidden";
            tagsActive.splice(tagsActive.indexOf(parseInt(e.params.data.id)), 1);
        });
        $('#selectBeacons').on("select2:select", function (e) {
            beaconsNode[parseInt(e.params.data.id)].style.visibility = "visible";
        });
        $('#selectBeacons').on("select2:unselect", function (e) {
            beaconsNode[parseInt(e.params.data.id)].style.visibility = "hidden";
        });
    });

    const createTagNode = (tag, disableDescription = false) => {
        const div = Object.assign(document.createElement("div"), {classList: "tag"});
        div.style.backgroundColor = stringToColour("tag" + tag.id * 100);

        if (!disableDescription) {
            const span = Object.assign(document.createElement("span"), {classList: "name"});
            span.innerText = "Tag no: " + tag.id;
            div.appendChild(span);
        }

        if (tag.room === 0)//320
        {
            //Longueur
            //11.30m qui doivent aller de 29.6% à 41.2% en largeur ==>posX * 1.03 +29.6
            var calcPosX = tag.posX * 1.03 + 29.6;
            if (calcPosX > 42.2) {
                calcPosX = 42.2;
            }
            div.style.left = calcPosX + "%";

            //Largeur
            //11m qui doivent aller de 0% à 49% ==> posY * 49/11 = 4.5
            var calcPosY = tag.posY * 4.5;
            if (calcPosY > 49) {
                calcPosY = 49;
            }
            div.style.bottom = calcPosY + "%";
            div.style.visibility = "hidden";
        } else if (tag.room === 1)//319
        {

        }

        return div;
    };

    const selectLiveTracking = document.getElementById("selectLiveTracking");
    const selectSpecificTime = document.getElementById("selectSpecificTime");
    const inputSpecificTime = document.getElementById("inputSpecificTime");

    const hideAllTagsHistory = () => {
        Object.values(tagsHistory).forEach(tagNodes => {
            tagNodes.forEach(tagNode => tagNode?.remove());
        });
    }

    const showAllTagsLiveTracking = () => {
        tagsNode.forEach(tagNode => {
            planElementsContainer.appendChild(tagNode);
        });
    };

    const hideAllTagsLiveTracking = () => {
        tagsNode.forEach(tagNode => {
            tagNode.remove();
        });
    };

    const tagsHistory = {};
    inputSpecificTime.addEventListener("keypress", e => {
        if (e.key !== 'Enter') return;

        // TODO : no uppercase in url
        axios.get("http://localhost/tags/get/historyPositions", {
            params: {
                tags: tagsActive,
                filter: e.target.value
            },
            paramsSerializer: params => {
                return window.Qs.stringify(params)
            }
        }).then(response => {
            hideAllTagsLiveTracking();
            hideAllTagsHistory();
            Object.values(response.data.TagHistory[0]).forEach(tag => {
                tag.forEach((position, i) => {
                    if (!tagsHistory[position.id]) {
                        tagsHistory[position.id] = [];
                    }
                    const tagNode = createTagNode(position, i > 0);
                    planElementsContainer.appendChild(tagNode);
                    tagsHistory[position.id].push(tagNode);

                    if (position.room === 0)//320
                    {
                        //Longueur
                        //11.30m qui doivent aller de 29.6% à 41.2% en largeur ==>posX * 1.03 +29.6
                        var calcPosX = position.posX * 1.03 + 29.6;
                        if (calcPosX > 42.2) {
                            calcPosX = 42.2;
                        }
                        tagNode.style.left = calcPosX + "%";

                        //Largeur
                        //11m qui doivent aller de 0% à 49% ==> posY * 49/11 = 4.5
                        var calcPosY = position.posY * 4.5;
                        if (calcPosY > 49) {
                            calcPosY = 49;
                        }
                        tagNode.style.bottom = calcPosY + "%";
                        tagNode.style.visibility = "visible";
                    } else if (tag.room === 1)//319
                    {

                    }
                });
            });
        });
    });

    intervalLiveTracking = setInterval(() => {
        if (tagsActive.length === 0) return;

        axios.get("http://localhost/tags/get/positions", {
            params: {
                tags: tagsActive,
                filter: "-1500ms" //TODO
            },
            paramsSerializer: params => {
                return window.Qs.stringify(params)
            }
        }).then(response => {
            hideAllTagsHistory();
            showAllTagsLiveTracking();
            tagsNode.forEach(tagNode => {
                tagNode.style.visibility = "hidden";
            });
            response.data.Tags.forEach(tag => {
                if (tag.room === 0)//320
                {
                    //Longueur
                    //11.30m qui doivent aller de 29.6% à 41.2% en largeur ==>posX * 1.03 +29.6
                    var calcPosX = tag.posX * 1.03 + 29.6;
                    if (calcPosX > 42.2) {
                        calcPosX = 42.2;
                    }
                    tagsNode[tag.id].style.left = calcPosX + "%";

                    //Largeur
                    //11m qui doivent aller de 0% à 49% ==> posY * 49/11 = 4.5
                    var calcPosY = tag.posY * 4.5;
                    if (calcPosY > 49) {
                        calcPosY = 49;
                    }
                    tagsNode[tag.id].style.bottom = calcPosY + "%";
                    tagsNode[tag.id].style.visibility = "visible";
                } else if (tag.room === 1)//319
                {

                }
            });
        });
    }, 500);

    selectLiveTracking.addEventListener("change", () => {
        const liveTrackingRequest = () => {
            hideAllTagsHistory();

            if (tagsActive.length === 0) return;

            axios.get("http://localhost/tags/get/positions", {
                params: {
                    tags: tagsActive,
                    filter: "-1500ms"
                }
            }).then(response => {
                showAllTagsLiveTracking();
                tagsNode.forEach(tagNode => {
                    tagNode.style.visibility = "hidden";
                });
                response.data.Tags.forEach(tag => {
                    tagsNode[tag.id].style.visibility = "hidden";
                    if (tag.room === 0)//320
                    {
                        //Longueur
                        //11.30m qui doivent aller de 29.6% à 41.2% en largeur ==>posX * 1.03 +29.6
                        var calcPosX = tag.posX * 1.03 + 29.6;
                        if (calcPosX > 42.2) {
                            calcPosX = 42.2;
                        }
                        tagsNode[tag.id].style.left = calcPosX + "%";

                        //Largeur
                        //11m qui doivent aller de 0% à 49% ==> posY * 49/11 = 4.5
                        var calcPosY = tag.posY * 4.5;
                        if (calcPosY > 49) {
                            calcPosY = 49;
                        }
                        tagsNode[tag.id].style.bottom = calcPosY + "%";
                        tagsNode[tag.id].style.visibility = "visible";
                    } else if (tag.room === 1)//319
                    {

                    }
                });
            });
        };

        intervalLiveTracking = setInterval(() => {
            liveTrackingRequest();
        }, 500);
        liveTrackingRequest();

        selectedFilter = 1
        inputSpecificTime.classList.add("disable");
    });
    selectSpecificTime.addEventListener("change", () => {
        selectedFilter = 2
        inputSpecificTime.classList.remove("disable");
        clearInterval(intervalLiveTracking);
    });

    const planElementsContainer = document.getElementById("planElementsContainer");
    const selectTags = document.getElementById("selectTags");
    const selectBeacons = document.getElementById("selectBeacons");

    const drawBeaconsOnPlan = () => {
        const createBeaconNode = beacon => {
            const div = Object.assign(document.createElement("div"), {classList: "beacon"});
            div.style.backgroundColor = stringToColour("beacon" + beacon.id * 100);

            const span = Object.assign(document.createElement("span"), {classList: "name"});
            span.innerText = "Beacon no: " + beacon.id;
            div.appendChild(span);

            if (beacon.room === 0)//320
            {
                //Longueur
                //11.30m qui doivent aller de 29.6% à 41.2% en largeur ==>posX * 1.03 +29.6
                var calcPosX = beacon.posX * 1.03 + 29.6;
                if (calcPosX > 42.2) {
                    calcPosX = 42.2;
                }
                div.style.left = calcPosX + "%";

                //Largeur
                //11m qui doivent aller de 0% à 49% ==> posY * 49/11 = 4.5
                var calcPosY = beacon.posY * 4.5;
                if (calcPosY > 49) {
                    calcPosY = 49;
                }
                div.style.bottom = calcPosY + "%";
                div.style.visibility = "hidden";
            } else if (beacon.room === 1)//319
            {

            }
            console.log(div)
            return div;
        };

        axios.get(apiUrl + "beacons").then(response => {
            const beacons = response.data.Beacons;

            beacons.forEach(beacon => {
                beaconsNode[beacon.id] = createBeaconNode(beacon);
                planElementsContainer.appendChild(beaconsNode[beacon.id]);

                const option = Object.assign(document.createElement("option"), {
                    value: beacon.id,
                    innerText: "Beacon no: " + beacon.id
                });
                selectBeacons.appendChild(option);
            });
        });
    };
    drawBeaconsOnPlan();

    const drawTagsOnPlan = () => {

        axios.get(apiUrl + "tags").then(response => {
            const tags = response.data.Tags;

            tags.forEach(tag => {
                tagsNode[tag.id] = createTagNode(tag);
                planElementsContainer.appendChild(tagsNode[tag.id]);

                const option = Object.assign(document.createElement("option"), {
                    value: tag.id,
                    innerText: "Tag no: " + tag.id
                });
                selectTags.appendChild(option);
            });
        });
    };
    drawTagsOnPlan();
});

var t0 = document.getElementById("tag0");
var t1 = document.getElementById("tag1");
var t2 = document.getElementById("tag2");

var tagMap = new Map();
tagMap.set(t0, null);
tagMap.set(t1, null);
tagMap.set(t2, 'id2');


//Links an id with one of the displayed tag in tagMap
function push(id) {
    for (let [key, value] of tagMap.entries()) {
        if (value == null) {
            value = id;
            break;
        }
    }
}

//Removes the id and frees the displayed tag in tagMap
function remove(id) {
    for (let [key, value] of tagMap.entries()) {
        if (value == id) {
            value = null;
            break;
        }
    }
}