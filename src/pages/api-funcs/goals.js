export async function fetchGoals(userId){
    const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_DOMAIN}/retrieve-goals?userId=${userId}`, {method: "GET"})
    console.log("Goals response:", response, response.ok)
    if(!response.ok){
        throw new Error('Network response was not ok')
    }
    return response.json()
}