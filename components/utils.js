// Utility function to format date
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Utility function to format time
export const formatTime = (timeString) => {
  // Assuming timeString is like "10:00 AM" or "05:00 PM"
  return timeString;
};

// Utility function to convert number to words (Simplified for Bengali)
export const numberToWordsBn = (num) => {
  const units = ["", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়"];
  const teens = ["দশ", "এগারো", "বারো", "তেরো", "চৌদ্দ", "পনেরো", "ষোলো", "সতেরো", "আঠারো", "উনিশ"];
  const tens = ["", "", "বিশ", "ত্রিশ", "চল্লিশ", "পঞ্চাশ", "ষাট", "সত্তর", "আশি", "নব্বই"];
  const scales = ["", "হাজার", "লাখ", "কোটি"];

  if (num === 0) return "শূন্য টাকা";

  let words = [];
  let i = 0;

  const numStr = String(num);
  let parts = [];

  // Split number into parts for thousands, lakhs, crores
  // This is a simplified logic and might not cover all large numbers perfectly in Bengali
  let currentNum = num;
  while (currentNum > 0) {
    parts.push(currentNum % 1000);
    currentNum = Math.floor(currentNum / 1000);
  }

  // Iterate through parts (e.g., 123, 45, 67 for 67,45,123)
  for (let j = 0; j < parts.length; j++) {
    let part = parts[j];
    let partWords = [];

    if (part > 0) {
      if (part >= 100) {
        partWords.push(units[Math.floor(part / 100)] + " শত");
        part %= 100;
      }
      if (part >= 20) {
        partWords.push(tens[Math.floor(part / 10)]);
        part %= 10;
      }
      if (part >= 10) {
        partWords.push(teens[part - 10]);
        part = 0;
      }
      if (part > 0) {
        partWords.push(units[part]);
      }
    }

    if (partWords.length > 0) {
      words.unshift(partWords.join(" ") + " " + scales[j]);
    }
  }

  return words.join(" ").trim() + " টাকা";
}; 