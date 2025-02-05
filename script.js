class Blog {
    constructor(id, title, content, tags) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.tags = tags; // เพิ่มแท็กเข้าไป
        this.createdDate = new Date();
        this.updatedDate = new Date();
    }

    update(title, content, tags) {
        this.title = title;
        this.content = content;
        this.tags = tags;
        this.updatedDate = new Date();
    }

    getFormattedDate() {
        return this.updatedDate.toLocaleString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
}

class BlogManager {
    constructor() {
        this.blogs = this.loadBlogs(); // โหลดข้อมูลจาก LocalStorage
    }

    addBlog(title, content, tags) {
        const blog = new Blog(Date.now(), title, content, tags);
        this.blogs.push(blog);
        this.saveBlogs();
        return blog;
    }

    updateBlog(id, title, content, tags) {
        const blog = this.getBlog(id);
        if (blog) {
            blog.update(title, content, tags);
            this.saveBlogs();
        }
        return blog;
    }

    deleteBlog(id) {
        this.blogs = this.blogs.filter((blog) => blog.id !== id);
        this.saveBlogs();
    }

    getBlog(id) {
        return this.blogs.find((blog) => blog.id === id);
    }

    saveBlogs() {
        localStorage.setItem("blogs", JSON.stringify(this.blogs));
    }

    loadBlogs() {
        const storedBlogs = localStorage.getItem("blogs");
        if (!storedBlogs) return [];
        
        return JSON.parse(storedBlogs).map(blogData => {
            return new Blog(
                blogData.id,
                blogData.title,
                blogData.content,
                blogData.tags,
                new Date(blogData.createdDate),
                new Date(blogData.updatedDate)
            );
        });
    }

    getUniqueTags() {
        const tags = new Set();
        this.blogs.forEach(blog => blog.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags);
    }
}


class BlogUI {
    constructor(blogManager) {
        this.blogManager = blogManager;
        this.initElements();
        this.initEventListeners();
        this.render();
        this.renderTagFilter();
    }

    initElements() {
        this.form = document.getElementById("blog-form");
        this.titleInput = document.getElementById("title");
        this.contentInput = document.getElementById("content");
        this.tagsInput = document.getElementById("tags");
        this.editIdInput = document.getElementById("edit-id");
        this.formTitle = document.getElementById("form-title");
        this.cancelBtn = document.getElementById("cancel-btn");
        this.blogList = document.getElementById("blog-list");
        this.tagFilter = document.getElementById("tag-filter");
    }

    initEventListeners() {
        this.form.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        this.cancelBtn.addEventListener("click", () => {
            this.resetForm();
        });

        this.tagFilter.addEventListener("change", () => {
            this.render();
        });
    }

    handleSubmit() {
        const title = this.titleInput.value.trim();
        const content = this.contentInput.value.trim();
        const tags = this.tagsInput.value.split(",").map(tag => tag.trim()).filter(tag => tag !== ""); 
        const editId = parseInt(this.editIdInput.value);
    
        if (!title || !content) {
            alert("กรุณากรอกชื่อเรื่องและเนื้อหาของบล็อก");
            return;
        }
    
        if (editId) {
            this.blogManager.updateBlog(editId, title, content, tags);
        } else {
            this.blogManager.addBlog(title, content, tags);
        }
        
        this.resetForm();
        this.render();
        this.renderTagFilter();
    }
    

    editBlog(id) {
        const blog = this.blogManager.getBlog(id);
        if (blog) {
            this.titleInput.value = blog.title;
            this.contentInput.value = blog.content;
            this.tagsInput.value = blog.tags.join(", ");
            this.editIdInput.value = blog.id;
            this.formTitle.textContent = "แก้ไขบล็อก";
            this.cancelBtn.classList.remove("hidden");
            window.scrollTo(0, 0);
        }
    }

    deleteBlog(id) {
        if (confirm("ต้องการลบบล็อกนี้ใช่หรือไม่?")) {
            this.blogManager.deleteBlog(id);
            this.render();
            this.renderTagFilter();
        }
    }

    resetForm() {
        this.form.reset();
        this.editIdInput.value = "";
        this.formTitle.textContent = "เขียนบล็อกใหม่";
        this.cancelBtn.classList.add("hidden");
    }

    render() {
        const selectedTag = this.tagFilter.value;
        this.blogList.innerHTML = this.blogManager.blogs
            .filter(blog => selectedTag === "" || blog.tags.includes(selectedTag))
            .map(
                (blog) => `
                <div class="blog-post">
                    <h2 class="blog-title">${blog.title}</h2>
                    <div class="blog-date">อัปเดตเมื่อ: ${blog.getFormattedDate()}</div>
                    <div class="blog-content">${blog.content.replace(/\n/g, "<br>")}</div>
                    <div class="blog-tags">แท็ก: ${blog.tags.map(tag => `<span class="tag">${tag}</span>`).join(", ")}</div>
                    <div class="blog-actions">
                        <button class="btn-edit" onclick="blogUI.editBlog(${blog.id})">แก้ไข</button>
                        <button class="btn-delete" onclick="blogUI.deleteBlog(${blog.id})">ลบ</button>
                    </div>
                </div>
            `
            )
            .join("");
    }

    renderTagFilter() {
        const tags = this.blogManager.getUniqueTags();
        this.tagFilter.innerHTML = `<option value="">ทั้งหมด</option>` + tags.map(tag => `<option value="${tag}">${tag}</option>`).join("");
    }
    
}

// เพิ่ม input field สำหรับแท็กใน HTML
document.getElementById("blog-form").innerHTML += `
    <input type="text" id="tags" placeholder="แท็ก (ใช้เครื่องหมาย , คั่น)" />
`;

// เพิ่ม dropdown filter ใน HTML
document.body.innerHTML += `
    <div class="filter-section">
        <label for="tag-filter">กรองตามแท็ก: </label>
        <select id="tag-filter">
            <option value="">ทั้งหมด</option>
        </select>
    </div>
`;

// สร้าง instance และเริ่มใช้งาน
const blogManager = new BlogManager();
const blogUI = new BlogUI(blogManager);
