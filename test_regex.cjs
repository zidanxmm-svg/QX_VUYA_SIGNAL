const text = "1. 14:41 USD/COP OTC DOWN\n2. 14:46 USD/COP OTC UP";
const signals = [];
const lines = text.split("\n");

      lines.forEach((line) => {
        const cleanLine = line.trim();
        if (!cleanLine) return;

        let sig = null;
        const match1 = cleanLine.match(/(\d{2}:\d{2})\s+([\w\/ -]+)\s+(CALL|PUT|UP|DOWN)/i);
        if (match1) {
          sig = { 
            time: match1[1], 
            symbol: match1[2].trim().replace(/\s+/g, '-'), 
            direction: match1[3].toUpperCase() === 'UP' ? 'CALL' : (match1[3].toUpperCase() === 'DOWN' ? 'PUT' : match1[3].toUpperCase())
          };
        } else {
          const parts = cleanLine.split(";");
          if (parts.length >= 4) {
            sig = { 
              time: parts[2].trim(), 
              symbol: parts[1].trim(), 
              direction: parts[3].trim().toUpperCase() === 'UP' ? 'CALL' : (parts[3].trim().toUpperCase() === 'DOWN' ? 'PUT' : parts[3].trim().toUpperCase())
            };
          }
        }
        
        console.log(sig, sig?.time.match(/^\d{2}:\d{2}$/));
      });
