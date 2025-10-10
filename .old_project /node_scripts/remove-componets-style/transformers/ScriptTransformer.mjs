export default [{
  regex: /<script([^>]*>)/gm,
  to(content, matches) {
    if (!matches[0].includes('setup')) {
      content = content.replace(matches[0], `<script setup ${matches[1].trim()}`);
    }
    return content;
  }
}]
