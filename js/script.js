document.addEventListener('DOMContentLoaded', function() {
    const deliveryListElement = document.getElementById("delivery-list");
    const droneListElement = document.getElementById("drone-list");
    const createDroneButton = document.getElementById("create-drone-button");
    const createDeliveryButton = document.getElementById("create-delivery-button");


    function fetchActiveDeliveries() {
        fetch('http://localhost:8080/deliveries')
            .then(response => response.json())
            .then(deliveries => {
                updateDeliveryList(deliveries);
            })
            .catch(error => console.error('Fejl ved hentning af leveringer:', error));
    }

    function fetchDrones() {
        fetch('http://localhost:8080/drones')
            .then(response => response.json())
            .then(drones => {
                updateDroneList(drones);
            })
            .catch(error => console.error('Fejl ved hentning af droner:', error));
    }


    function updateDeliveryList(deliveries) {
        deliveryListElement.innerHTML = '';

        deliveries.forEach(delivery => {
            const listItem = document.createElement('li');
            listItem.classList.add('delivery-item');

            const assignButton = document.createElement('button');
            assignButton.classList.add('button');
            assignButton.textContent = 'Tildel Drone';
            assignButton.addEventListener('click', function () {
                assignDrone(delivery.deliveryId);
            });

            const finishButton = document.createElement('button');
            finishButton.classList.add('button');
            finishButton.textContent = 'Afslut Levering';
            finishButton.addEventListener('click', function () {
                finishDelivery(delivery.deliveryId);
            });

            listItem.innerHTML = `
                <span>${delivery.pizza.titel} - Forventet levering: ${new Date(delivery.expectedDeliveryTime).toLocaleString()}</span>
                <span>${delivery.drone ? 'Drone tildelt' : 'Ingen drone tildelt'}</span>
            `;


            listItem.appendChild(assignButton);
            listItem.appendChild(finishButton);

            deliveryListElement.appendChild(listItem);
        });
    }


    function updateDroneList(drones) {
        droneListElement.innerHTML = '';

        drones.forEach(drone => {
            const listItem = document.createElement('li');
            listItem.classList.add('delivery-item');

            listItem.innerHTML = `
                <span>Drone ID: ${drone.droneId} - Status: ${drone.driftsstatus}</span>
            `;
            droneListElement.appendChild(listItem);
        });
    }



    function assignDrone(deliveryId) {
        const serialUuid = prompt('Indtast drone UUID for tildeling:');
        if (serialUuid) {

            const url = `http://localhost:8080/deliveries/schedule/${deliveryId}/${serialUuid}`;


            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        alert('Drone tilføjet til levering');
                        fetchActiveDeliveries(); // Opdater listen
                    } else {
                        alert('Fejl ved tildeling af drone');
                    }
                })
                .catch(error => {
                    console.error('Fejl ved anmodning:', error);
                    alert('Fejl ved tildeling af drone');
                });
        }
    }





    function finishDelivery(deliveryId) {
        fetch(`http://localhost:8080/deliveries/finish/${deliveryId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }

        })
            .then(response => {
                if (response.ok) {
                    alert('Levering afsluttet');
                    fetchActiveDeliveries();
                } else {
                    alert('Fejl ved afslutning af levering');
                }
            })
            .catch(error => {
                console.error('Fejl ved afslutning af levering:', error);
                alert('Fejl ved afslutning af levering');
            });
    }


    createDroneButton.addEventListener('click', function() {
        fetch('http://localhost:8080/drones/add', { method: 'POST' })
            .then(response => {
                if (response.ok) {
                    alert('Ny drone oprettet');
                    fetchDrones();  // Opdater drone-listen
                } else {
                    alert('Fejl ved oprettelse af drone');
                }
            });
    });


    createDeliveryButton.addEventListener('click', function() {
        const pizzaId = prompt('Indtast pizza ID for levering:');
        if (pizzaId) {
            fetch(`http://localhost:8080/deliveries/add?pizzaId=${pizzaId}`, { method: 'POST' })
                .then(response => response.json())
                .then(newDelivery => {
                    alert('Ny levering oprettet');
                    fetchActiveDeliveries(); // Opdater leveringslisten
                })
                .catch(error => console.error('Fejl ved oprettelse af levering:', error));
        }
    });


    fetchActiveDeliveries();
    fetchDrones();



    setInterval(() => {
        fetchActiveDeliveries();
        fetchDrones();
    }, 60000); // 60.000 ms = 60 sekunder
});

//TODO: lav en knap der kan tildele drone til en levering
//TODO: lav en side der simulerer en kundebestilling // • Mulighed for at simulere, at en levering af en pizza bliver oprettet (af kunden)<
