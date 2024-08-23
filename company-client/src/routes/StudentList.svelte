<script>
    import { CompanyStore, StudentStore } from "./stores";

    export let company = {};
    export let getCurrent;

    const handleDequeue = async (company) => {
        try {
            
            let id = company._id || company.id;
            const res = await fetch('http://localhost:4006/studentDequeue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    company_id: id,
                }),
            });
            
            if (res.ok) {
                const data = await res.json();
                CompanyStore.set({...data.company, name: company.name});

                if(data.new_assigned && Object.keys(data.new_assigned).length > 0){
                    await getCurrent(data.new_assigned.id);
                } else{
                    StudentStore.set({name: 'None'});
                }
                console.log('Student successfully dequeued.');
                
            } else {
                console.error('Failed to dequeue student.');
            }
        } catch (error) {
            console.error('Error occurred during dequeueing:', error);
        }
        
    };

</script>

<div class="container">
    <h4>Total People: {company.queue.length} | Available: {company.available.length}</h4>

    <button on:click={handleDequeue(company)} class="dequeue-button">Next Student</button>

</div>

<style>
    .container {
        margin: 20px;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    h4 {
        font-size: 18px;
        margin-bottom: 15px;
    }

    .dequeue-button {
        padding: 10px 15px;
        font-size: 16px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

</style>
