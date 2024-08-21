
const sideBar = document.getElementById("sidebaricon")
const navSection = document.querySelector(".sidebar")
const back = document.querySelector(".back")
const increase = document.querySelector("#incr")
const decreasse = document.querySelector("#decr")
const stake = document.querySelector("#stake")




sideBar.addEventListener("click", () => {
    navSection.style.display = 'block'
})
back.addEventListener("click", () => {
    navSection.style.display = 'none'
})

increase.addEventListener("click", () => {
    let stake = document.querySelector("#stake");
    stake.value++
})
decreasse.addEventListener("click", () => {
    let stake = document.querySelector("#stake");
    if (stake.value > 5) {
        stake.value--
    }

})

