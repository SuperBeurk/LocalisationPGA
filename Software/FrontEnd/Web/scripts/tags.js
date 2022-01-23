const apiUrl = "http://localhost:80/"

const Utils = {
    /*
        Méthode qui génère une couleure hexadécimal aléatoire en fonction d'une chaîne de caractère
     */
    stringToColor: str => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            let value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    },
    /*
        Method to display our tag and beacon depending on posx,y and room information
     */
    calculatePosition: (node, data, visibility = "hidden") => {
        if (data.room === 0)//320
        {
            //Longueur
            //11.30m qui doivent aller de 29.6% à 41.2% en largeur ==>posX * 1.03 +29.6
            var calcPosX = data.posX * 1.03 + 29.6;
            if (calcPosX > 41.2) {
                calcPosX = 41.2;
            }
            node.style.left = calcPosX + "%";

            //Largeur
            //11m qui doivent aller de 0% à 49% ==> posY * 49/11 = 4.5
            var calcPosY = data.posY * 4.7;
            if (calcPosY > 49) {
                calcPosY = 49;
            }
            node.style.bottom = calcPosY + "%";
            node.style.visibility = visibility;
        } else if (data.room === 1)//319
        {
            //Longueur
            //11.30m qui doivent aller de 29.6% à 41.2% en largeur ==>posX * 1.03 +29.6
            var calcPosX = data.posX * 1.03 + 41.2;
            if (calcPosX > 50.5) {
                calcPosX = 50.5;
            }
            node.style.left = calcPosX + "%";

            //Largeur
            //11m qui doivent aller de 0% à 49% ==> posY * 49/11 = 4.5
            var calcPosY = data.posY * 4.7;
            if (calcPosY > 49) {
                calcPosY = 49;
            }
            node.style.bottom = calcPosY + "%";
            node.style.visibility = visibility;

        }
    }
};

const Beacons = {
    nodes: [],
    createNode: beacon => {
        const div = Object.assign(document.createElement("div"), {classList: "beacon"});
        div.style.backgroundColor = Utils.stringToColor("beacon" + beacon.id * 100);

        const span = Object.assign(document.createElement("span"), {classList: "name"});
        span.innerText = "Beacon no: " + beacon.id;
        div.appendChild(span);

        Utils.calculatePosition(div, beacon);

        return div;
    }
}

const Tags = {
    active: [],
    createNode: (tag, disableDescription) => {
        const div = Object.assign(document.createElement("div"), {classList: "tag"});
        div.style.backgroundColor = Utils.stringToColor("tag" + tag.id * 100);

        if (!disableDescription) {
            const span = Object.assign(document.createElement("span"), {classList: "name"});
            span.innerText = "Tag no: " + tag.id;
            div.appendChild(span);
        }

        Utils.calculatePosition(div, tag);

        return div;
    },
    liveTracking: {
        nodes: [],
        showAllNodes: () => {
            const planElementsContainer = document.getElementById("planElementsContainer");

            Tags.liveTracking.nodes.forEach(tagNode => {
                planElementsContainer.appendChild(tagNode);
            });
        },
        hideAllNodes: () => {
            Tags.liveTracking.nodes.forEach(tagNode => {
                tagNode.remove();
            });
        }
    },
    history: {
        nodes: {},
        hideAllNodes: () => {
            Object.values(Tags.history.nodes).forEach(tagNodes => {
                tagNodes.forEach(tagNode => tagNode?.remove());
            });
        },
    }
};
//When a client open our window
window.addEventListener("DOMContentLoaded", e => {
    let selectedFilter = null;

    let intervalLiveTracking;

    //Textbox things
    $(document).ready(function () {
        $('#selectTags').select2();
        $('#selectBeacons').select2();
        $('#selectTags').on("select2:select", function (e) {
            Tags.active.push(parseInt(e.params.data.id));
        });
        $('#selectTags').on("select2:unselect", function (e) {
            Tags.liveTracking.nodes[parseInt(e.params.data.id)].style.visibility = "hidden";
            Tags.active.splice(Tags.active.indexOf(parseInt(e.params.data.id)), 1);
        });
        $('#selectBeacons').on("select2:select", function (e) {
            Beacons.nodes[parseInt(e.params.data.id)].style.visibility = "visible";
        });
        $('#selectBeacons').on("select2:unselect", function (e) {
            Beacons.nodes[parseInt(e.params.data.id)].style.visibility = "hidden";
        });
    });


    const inputSpecificTime = document.getElementById("inputSpecificTime");
    inputSpecificTime.addEventListener("keypress", e => {
        if (e.key !== 'Enter') return;

        axios.get("http://localhost/tags/get/historyPositions", {
            params: {
                tags: Tags.active,
                filter: e.target.value
            },
            paramsSerializer: params => {
                return window.Qs.stringify(params)
            }
        }).then(response => {
            Tags.liveTracking.hideAllNodes();
            Tags.history.hideAllNodes();

            Object.values(response.data.TagHistory[0]).forEach(tag => {
                tag.forEach((position, i) => {
                    if (!Tags.history.nodes[position.id]) {
                        Tags.history.nodes[position.id] = [];
                    }
                    const tagNode = Tags.createNode(position, i > 0);
                    planElementsContainer.appendChild(tagNode);
                    Tags.history.nodes[position.id].push(tagNode);

                    Utils.calculatePosition(tagNode, position, "visible");
                });
            });
        });
    });

    intervalLiveTracking = setInterval(() => {
        if (Tags.active.length === 0) return;

        axios.get("http://localhost/tags/get/positions", {
            params: {
                tags: Tags.active,
                filter: "-1500ms" //TODO
            },
            paramsSerializer: params => {
                return window.Qs.stringify(params)
            }
        }).then(response => {
            Tags.history.hideAllNodes();
            Tags.liveTracking.showAllNodes();

            Tags.liveTracking.nodes.forEach(tagNode => {
                tagNode.style.visibility = "hidden";
            });
            response.data.Tags.forEach(tag => {
                Utils.calculatePosition(Tags.liveTracking.nodes[tag.id], tag, "visible");
            });
        });
    }, 500);

    const planElementsContainer = document.getElementById("planElementsContainer");
    //get all existing beacon and create the nodes
    const drawBeaconsOnPlan = () => {
        axios.get(apiUrl + "beacons").then(response => {
            const beacons = response.data.Beacons;

            beacons.forEach(beacon => {
                Beacons.nodes[beacon.id] = Beacons.createNode(beacon);
                planElementsContainer.appendChild(Beacons.nodes[beacon.id]);

                const option = Object.assign(document.createElement("option"), {
                    value: beacon.id,
                    innerText: "Beacon no: " + beacon.id
                });
                document.getElementById("selectBeacons").appendChild(option);
            });
        });
    };
    //get all existing beacon and create the nodes
    const drawTagsOnPlan = () => {
        axios.get(apiUrl + "tags").then(response => {
            const tags = response.data.Tags;

            tags.forEach(tag => {
                Tags.liveTracking.nodes[tag.id] = Tags.createNode(tag);
                planElementsContainer.appendChild(Tags.liveTracking.nodes[tag.id]);

                const option = Object.assign(document.createElement("option"), {
                    value: tag.id,
                    innerText: "Tag no: " + tag.id
                });
                document.getElementById("selectTags").appendChild(option);
            });
        });
    };
    drawBeaconsOnPlan();
    drawTagsOnPlan();

    const selectSpecificTime = document.getElementById("selectSpecificTime");
    selectSpecificTime.addEventListener("change", () => {
        selectedFilter = 2
        inputSpecificTime.classList.remove("disable");
        clearInterval(intervalLiveTracking);
    });

    //live Tracking
    const selectLiveTracking = document.getElementById("selectLiveTracking");
    selectLiveTracking.addEventListener("change", () => {
        const liveTrackingRequest = () => {
            //remove tag history node form display
            Tags.history.hideAllNodes();

            //if no tag selected return
            if (Tags.active.length === 0) return;

            //http request
            axios.get("http://localhost/tags/get/positions", {
                params: {
                    tags: Tags.active,
                    filter: "-1500ms"
                }
            }).then(response => {
                Tags.liveTracking.showAllNodes();
                //calculate position and display tag
                response.data.Tags.forEach(tag => {
                    Tags.liveTracking.nodes[tag.id].style.visibility = "hidden";
                    Utils.calculatePosition(Tags.liveTracking.nodes[tag.id], tag, "visible");
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
});
