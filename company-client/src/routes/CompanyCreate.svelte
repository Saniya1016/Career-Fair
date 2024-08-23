<script>
    import { CompanyStore, StudentStore } from "./stores.js";
    import StudentList from "./StudentList.svelte";
    import { onMount } from "svelte";

    let userName = '';
    let userId = '';

    let isLoggedIn = '';
    let company = {};
    let student = {};

    CompanyStore.subscribe((_company) => {
        company = _company;
    });

    StudentStore.subscribe((_student) => {
        student = _student;
    });

    onMount( async () => {
        userId = localStorage.getItem('id');
        if(userId !== ''){
            const res = await fetch(`http://localhost:4001/company/${userId}`);
            const data = await res.json();
            if(Object.keys(data).length === 0){
                console.log(userId);
            } else{
                CompanyStore.set(data);
                await getCurrent(data.current_student);
                isLoggedIn = true;
            }
        }
        console.log(company);
    });

    const getCurrent = async(id) => {
        if(id !== '') {
            const res = await fetch(`http://localhost:4002/student/${id}`);
            const data = await res.json();
            if(data){
                StudentStore.set(data);
            } else{
                StudentStore.set({name: 'None'});
            }
        } else{
            StudentStore.set({name: 'None'});
        }
    };

    const handleRegister = async (event) => {
        event.preventDefault();
        const res = await fetch('http://localhost:4001/company', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: userName }),
        });

        const data = await res.json();
        console.log(`Client: ${JSON.stringify(data)}`);

        alert(`Your id is ${data._id}`);
    }

    const handleLogin = async (event) => {
        event.preventDefault();
        const res = await fetch(`http://localhost:4001/company/${userId}`);
        const data = await res.json();
        if(Object.keys(data).length === 0){
            alert('Invalid id');
        } else {
            isLoggedIn = true;
            CompanyStore.set(data);
            await getCurrent(data.current_student);
            localStorage.setItem('id', data._id);
        }
    }

</script>


<form on:submit={handleRegister} class="container">
    <div class="mb-3">
        <label for="name" class="form-label">Enter company name:</label>
        <input type="text" id="name" bind:value={userName} class="form-control" placeholder="Company name" />
    </div>
    <button type="submit" class="btn btn-primary">Register</button>
</form>

<form on:submit={handleLogin} class="container">
    <div class="mb-3">
        <label for="user_id" class="form-label">Enter company id:</label>
        <input type="text" id="user_id" bind:value={userId} class="form-control" placeholder="Company Id" />
    </div>
    <button type="submit" class="btn btn-primary">Log-in</button>
</form>


{#if isLoggedIn}
    <h1 class="container">Welcome {company.name}!</h1>

    <h5>Student Name: {student.name}</h5>

    <StudentList company={company} getCurrent={getCurrent}/>
{:else}
    <h1 class="container">Please Log in</h1>
{/if}