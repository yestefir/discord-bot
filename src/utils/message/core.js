function calculateSimilarity(str1, str2) {

    const matrix = Array(str1.length + 1).fill().map(() => Array(str2.length + 1).fill(0));
    
    for (let i = 0; i <= str1.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= str2.length; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        const cost = str1[i-1] === str2[j-1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i-1][j] + 1,
          matrix[i][j-1] + 1,
          matrix[i-1][j-1] + cost
        );
      }
    }
    

    const maxDistance = Math.max(str1.length, str2.length);
    if (maxDistance === 0) return 100;
    
    const similarity = ((maxDistance - matrix[str1.length][str2.length]) / maxDistance) * 100;
    return similarity;
  }
  
  module.exports = calculateSimilarity;