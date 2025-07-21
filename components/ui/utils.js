// Date formatting utility
export function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

// Time formatting utility
export function formatTime(timeString) {
  if (!timeString) return '';
  
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
}

// Number to Bengali words conversion
export function numberToWordsBn(num) {
  if (num === 0) return 'শূন্য';
  
  const ones = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়'];
  const teens = ['দশ', 'এগার', 'বার', 'তের', 'চৌদ্দ', 'পনের', 'ষোল', 'সতের', 'আঠার', 'উনিশ'];
  const tens = ['', '', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];
  
  function convertHundreds(n) {
    let result = '';
    
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' শত ';
      n %= 100;
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)];
      if (n % 10 !== 0) {
        result += ' ' + ones[n % 10];
      }
    } else if (n >= 10) {
      result += teens[n - 10];
    } else if (n > 0) {
      result += ones[n];
    }
    
    return result.trim();
  }
  
  if (num < 1000) {
    return convertHundreds(num);
  } else if (num < 100000) {
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    let result = convertHundreds(thousands) + ' হাজার';
    if (remainder > 0) {
      result += ' ' + convertHundreds(remainder);
    }
    return result.trim();
  } else {
    const lakhs = Math.floor(num / 100000);
    const remainder = num % 100000;
    let result = convertHundreds(lakhs) + ' লাখ';
    if (remainder > 0) {
      if (remainder >= 1000) {
        const thousands = Math.floor(remainder / 1000);
        const finalRemainder = remainder % 1000;
        result += ' ' + convertHundreds(thousands) + ' হাজার';
        if (finalRemainder > 0) {
          result += ' ' + convertHundreds(finalRemainder);
        }
      } else {
        result += ' ' + convertHundreds(remainder);
      }
    }
    return result.trim();
  }
} 