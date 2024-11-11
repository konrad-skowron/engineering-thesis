export const formatTimestamp = (createdAt : any) => {
    const date = new Date(createdAt.seconds * 1000 + Math.floor(createdAt.nanoseconds / 1e6));
    return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
  }
