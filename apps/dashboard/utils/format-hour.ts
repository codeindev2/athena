export function formatTime(time:string) {
    // Split the time string into components
    let parts = time.split(':');
    
    // Return the hours and minutes, joined by a colon
    return `${parts[0]}:${parts[1]}`;
  }