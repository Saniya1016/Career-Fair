<script>
    import BookedList from "./BookedList.svelte";
    import { StudentStore } from "./stores";

    export let student = {};
    export let companies = {};
    export let fetchCompanies;

   const handleQueue = async (companyId) => {
        try {
           const res = await fetch('http://localhost:4006/studentEnqueue', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                   student_id: student.id,
                   company_id: companyId,
               }),
           });

           if (res.ok) {
               const data = await res.json();
               console.log(data);
               StudentStore.set({...data.student, name: student.name});
               await fetchCompanies();
               console.log('Student successfully queued.');
           } else {
               console.error('Failed to queue student.');
           }
       } catch (error) {
           console.error('Error occurred during queueing:', error);
       }

   };

   const handleDisable = (company_id) => {
        const index = student.companies.findIndex((elem) => elem === company_id);
        return index >= 0;
   };

</script>

<div class="container">
    <h1>Companies</h1>
    {#each Object.entries(companies) as [_, company] (company._id)}
        <div class="company">
            <h3>Name: {company.name}</h3>
            <h5>Total People: {company.queue.length}</h5>
            <button
                on:click={() => handleQueue(company._id)}
                disabled={handleDisable(company._id)}
            >
                Add
            </button>
        </div>
    {/each}
</div>

<BookedList student={student}/>

<style>
    .container {
        margin: 20px;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    h1 {
        font-size: 24px;
        margin-bottom: 15px;
    }

    .company {
        margin-bottom: 20px;
        padding: 15px;
        border: 1px solid #e0e0e0;
        border-radius: 5px;
    }

    h3 {
        font-size: 20px;
        margin-bottom: 10px;
    }

    h5 {
        font-size: 16px;
        margin-bottom: 5px;
    }

    button {
        padding: 8px 15px;
        font-size: 16px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
</style>
