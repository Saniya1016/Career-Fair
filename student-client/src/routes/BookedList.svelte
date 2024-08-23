<script>
    export let student = {};
    let booked_companies = [];

    $: (async () => {
        let temp_list = [];

        for (let i = 0; i < student.companies.length; ++i) {
            let id = student.companies[i];
            const res = await fetch(`http://localhost:4001/company/${id}`);
            const data = await res.json();
            const people = data.queue.findIndex((elem) => elem[0] === student.id);
            temp_list.push([data.name, people]);
        }

        booked_companies = temp_list;
    })();


</script>

<div class="container">
    <h1>Bookings</h1>
    <ul>
        {#each booked_companies as item, index (index)}
            <li class="booking-item">
                {index + 1}. Name: {item[0]} | People Ahead: {item[1]}
            </li>
        {/each}
    </ul>
</div>

<style>
    .container {
        margin-top: 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 10px;
    }

    h1 {
        margin-bottom: 10px;
        font-size: 20px;
    }

    ul {
        list-style: none;
        padding: 0;
    }

    .booking-item {
        margin-bottom: 8px;
        padding: 8px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        background-color: #f9f9f9;
        font-size: 16px;
    }
</style>
