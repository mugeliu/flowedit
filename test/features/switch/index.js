// Switch开关组件
export function createSwitch() {
  const container = document.createElement("div");
  container.className = "my-ext-switch";
  container.innerHTML = `
    <div class="my-ext-switch-track"></div>
    <div class="my-ext-switch-thumb"></div>
  `;
  let isOn = false;
  container.addEventListener("click", () => {
    isOn = !isOn;
    container.classList.toggle("on", isOn);
    const articleList = document.getElementById("js_side_article_list");
    if (articleList) {
      articleList.style.display = isOn ? "none" : "block";
    }
  });
  return container;
}
