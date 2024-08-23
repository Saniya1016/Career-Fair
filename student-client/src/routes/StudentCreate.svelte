<script>
    import { StudentStore, CompanyStore } from './stores.js';
    import CompanyList from './CompanyList.svelte';
    import { onMount } from 'svelte';

    let student = {};
    let companies = {};
    let id = '';
    let name = '';

    let userName = ''; //set while registering
    let userId = '';  //set while registering

    let isLoggedIn = false; //true when loggedin

    CompanyStore.subscribe((_companies) => {
        companies = _companies;
        console.log(companies);
    });

    const fetchCompanies = async () => {
        const res = await fetch('http://localhost:4001/companies');
        const data = await res.json();
        console.log(data);
        CompanyStore.set(data);
    }

    onMount(async () => {
        
        id = localStorage.getItem('id') || '';
        console.log(id);
        if(id !== ''){
            const res = await fetch(`http://localhost:4002/student/${id}`);
            const data = await res.json();
            if(Object.keys(data).length === 0){
                console.log(id);
            } else{
                isLoggedIn = true;
                StudentStore.set(data);
            }
        }
        console.log(student);
        await getCurrent();
        await fetchCompanies();
    });

    StudentStore.subscribe((_student) => {
        student = _student;
    });

    const handleRegister = async (event) => {
        event.preventDefault();
        const res = await fetch('http://localhost:4002/student', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: userName }),
        });

        const data = await res.json();
        console.log(`Client: ${JSON.stringify(data)}`);

        alert(`Your id is ${data.id}`);
    };

    const getCurrent  =  async() => {
        if(student.current_company){
            const res = await fetch(`http://localhost:4001/company/${student.current_company}`);
            const data = await res.json();
            if(data){
                name = data.name;
            }
        } else{
            name = 'None';
        }
    };

    const handleLogin = async(event) => {
        const res = await fetch(`http://localhost:4002/student/${userId}`);
        const data = await res.json();
        if(Object.keys(data).length === 0){
            alert('Invalid id');
        } else{
            isLoggedIn = true;
            StudentStore.set(data);
            await getCurrent();
            await fetchCompanies();
            localStorage.setItem('id', data.id);
        }
    }

</script>

<!-- HTML structure with the form -->
<form on:submit={handleRegister} class="container">
    <div class="mb-3">
        <label for="name" class="form-label">Enter your name:</label>
        <input type="text" id="name" bind:value={userName} class="form-control" placeholder="Your name" />
    </div>
    <button type="submit" class="btn btn-primary">Register</button>
</form>

<form on:submit={handleLogin} class="container">
    <div class="mb-3">
        <label for="user_id" class="form-label">Enter your id:</label>
        <input type="text" id="user_id" bind:value={userId} class="form-control" placeholder="Your Id" />
    </div>
    <button type="submit" class="btn btn-primary">Log-in</button>
</form>

<!-- Place CompanyList component outside handleSubmit function -->
{#if isLoggedIn}
    <h1 class="container">Welcome {student.name}!</h1>
    <h5>Current Company: {name}</h5>
    <CompanyList student={student} companies={companies} fetchCompanies={fetchCompanies}/>
{:else}
    <h1 class="container">Please Log in</h1>
{/if}

<style>
    /* Bootstrap classes */
    form {
        margin-bottom: 20px;
    }

    label {
        margin-bottom: 5px;
    }

    input[type="text"] {
        margin-bottom: 10px;
    }

    h1 {
        margin-top: 20px;
        margin-bottom: 10px;
    }

    h5 {
        margin-bottom: 15px;
    }
</style>