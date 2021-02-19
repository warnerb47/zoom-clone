const newMeet = document.querySelector('#new-meet');
const join = document.querySelector('#join');
const link = document.querySelector('#link');

newMeet.addEventListener('click', () => {
    window.location = "/newMeet";
});

join.addEventListener('click', () => {
    const linkValue = link.value;
    if (linkValue) {
        window.location = "/" + linkValue;
    }else {
        console.log('no value');
    }
});