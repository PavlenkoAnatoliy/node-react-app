export default function(state = {}, action) {
  console.log(action, 'state', state);
  switch(action.type) {
    default:
      return state;
  }
}