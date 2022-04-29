interface String {
  replaceAll(match: string, replacement: string): string;
}

if (!String.prototype.replaceAll) {
  console.log('polyfilling replaceAll.');
  Object.assign(String.prototype, {
    replaceAll(match: string, replacement: string) {
      const escapeRegExp = (str: string) => {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
      };
      return this.replace(new RegExp(escapeRegExp(match), 'g'), () => replacement);
    },
  });
} else {
  console.log('replaceAll exists.');
}
