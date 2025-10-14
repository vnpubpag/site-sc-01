(() => {
    const topics = [
        {
            title: "Automate Shopify Product Imports",
            description: "Sync supplier spreadsheets into Shopify using scheduled flows and validation rules.",
            url: "#",
            tags: ["ecommerce", "automation", "shopify"],
            createdAt: "2024-12-04",
            featuredRank: 1
        },
        {
            title: "Run SEO Audits with Screaming Frog",
            description: "Configure crawl limits, custom extractions, and export blueprints for weekly audits.",
            url: "#",
            tags: ["seo", "marketing", "automation"],
            createdAt: "2025-01-12",
            featuredRank: 3
        },
        {
            title: "Deploy Next.js on Vercel with Preview Links",
            description: "Manage environments, secrets, and access policies for collaborative previews.",
            url: "#",
            tags: ["development", "deployment", "nextjs"],
            createdAt: "2025-02-21",
            featuredRank: 2
        },
        {
            title: "Set Up Airtable Knowledge Bases",
            description: "Design scalable base schemas, views, and automations for editorial teams.",
            url: "#",
            tags: ["productivity", "documentation", "airtable"],
            createdAt: "2024-11-18",
            featuredRank: 5
        },
        {
            title: "Optimize WordPress for Core Web Vitals",
            description: "Implement caching, image pipelines, and delayed scripts to improve metrics.",
            url: "#",
            tags: ["wordpress", "performance"],
            createdAt: "2024-10-05",
            featuredRank: 4
        },
        {
            title: "Launch Email Drip Campaigns in Brevo",
            description: "Create segmented nurture journeys with reusable components and analytics.",
            url: "#",
            tags: ["email", "marketing"],
            createdAt: "2024-09-19",
            featuredRank: 7
        },
        {
            title: "Build Notion Client Portals",
            description: "Configure databases, templates, and share settings for agency deliverables.",
            url: "#",
            tags: ["notion", "operations"],
            createdAt: "2025-02-02",
            featuredRank: 6
        },
        {
            title: "Localize Landing Pages for Multi-Region Ads",
            description: "Translate copy, manage hreflang tags, and align creatives with geotargeting.",
            url: "#",
            tags: ["localization", "ads", "seo"],
            createdAt: "2024-08-22",
            featuredRank: 8
        },
        {
            title: "Design Canva Templates for Viral Reels",
            description: "Create reusable layouts, animation presets, and export checklists.",
            url: "#",
            tags: ["design", "social-media"],
            createdAt: "2025-03-05",
            featuredRank: 9
        },
        {
            title: "Measure Funnel Metrics in Looker Studio",
            description: "Connect GA4, set calculated fields, and publish dashboards for stakeholders.",
            url: "#",
            tags: ["analytics", "data"],
            createdAt: "2024-12-28",
            featuredRank: 10
        },
        {
            title: "Introduce QA Gates in GitHub Actions",
            description: "Add linting, accessibility scans, and merge checks to pull requests.",
            url: "#",
            tags: ["devops", "github"],
            createdAt: "2025-01-28",
            featuredRank: 11
        },
        {
            title: "Craft Knowledge Base Content in Zendesk",
            description: "Structure articles, automate suggestions, and monitor feedback loops.",
            url: "#",
            tags: ["support", "documentation"],
            createdAt: "2024-07-02",
            featuredRank: 12
        },
        {
            title: "Set Up Google Tag Manager Server-Side",
            description: "Deploy Cloud Run containers, forward client events, and monitor logs.",
            url: "#",
            tags: ["analytics", "tagging"],
            createdAt: "2025-03-01",
            featuredRank: 13
        },
        {
            title: "Build Linear Issue Workflows",
            description: "Customize statuses, automations, and integrations for product squads.",
            url: "#",
            tags: ["product", "operations"],
            createdAt: "2024-11-02",
            featuredRank: 14
        },
        {
            title: "Introduce Offline Sync in Supabase",
            description: "Handle conflict resolution, row-level security, and client caching.",
            url: "#",
            tags: ["database", "supabase"],
            createdAt: "2025-02-15",
            featuredRank: 15
        },
        {
            title: "Produce SOP Videos with Descript",
            description: "Script, record, and publish annotated walkthroughs for internal training.",
            url: "#",
            tags: ["video", "operations"],
            createdAt: "2024-10-25",
            featuredRank: 16
        },
        {
            title: "Onboard Contributors with GitHub Projects",
            description: "Build project boards, templates, and status automation for new joiners.",
            url: "#",
            tags: ["project-management", "github"],
            createdAt: "2025-01-05",
            featuredRank: 17
        },
        {
            title: "Publish Microlearning Modules in Moodle",
            description: "Configure SCORM packages, quizzes, and progress tracking dashboards.",
            url: "#",
            tags: ["education", "lms"],
            createdAt: "2024-09-07",
            featuredRank: 18
        },
        {
            title: "Secure WordPress Membership Sites",
            description: "Set granular roles, payment gateways, and onboarding automation.",
            url: "#",
            tags: ["wordpress", "security"],
            createdAt: "2024-08-01",
            featuredRank: 19
        },
        {
            title: "Run Cross-Border E-Invoicing with MISA",
            description: "Handle tax rules, templates, and API integrations for Vietnam compliance.",
            url: "#",
            tags: ["finance", "vietnam"],
            createdAt: "2025-02-26",
            featuredRank: 20
        }
    ];

    const state = {
        filteredTopics: [...topics],
        currentPage: 1,
        sortMode: "featured"
    };

    const ITEMS_PER_PAGE = 9;

    const searchInput = document.getElementById("search-input");
    const searchForm = document.getElementById("search-form");
    const topicsGrid = document.getElementById("topics-grid");
    const paginationNode = document.getElementById("topic-pagination");
    const sortSelect = document.getElementById("sort-select");
    const currentYearNode = document.getElementById("current-year");

    const updateCurrentYear = () => {
        if (currentYearNode) {
            currentYearNode.textContent = String(new Date().getFullYear());
        }
    };

    const normalize = (value) => value.toLowerCase();

    const applyFilters = () => {
        const query = normalize(searchInput.value.trim());
        state.filteredTopics = topics.filter((topic) => {
            if (!query) {
                return true;
            }
            const haystack = [topic.title, topic.description, ...(topic.tags || [])]
                .map((part) => normalize(part))
                .join(" ");
            return haystack.includes(query);
        });
        state.currentPage = 1;
        applySort();
    };

    const applySort = () => {
        const sortMode = sortSelect.value;
        state.sortMode = sortMode;
        const sorter = {
            featured: (a, b) => a.featuredRank - b.featuredRank,
            az: (a, b) => a.title.localeCompare(b.title),
            recent: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        };
        const sortFn = sorter[sortMode] || sorter.featured;
        state.filteredTopics = [...state.filteredTopics].sort(sortFn);
        renderTopics();
    };

    const createCard = (topic) => {
        const col = document.createElement("div");
        col.className = "col-sm-6 col-lg-4";

        col.innerHTML = `
            <article class="card h-100 border-0 shadow-sm">
                <div class="card-body d-flex flex-column">
                    <span class="text-uppercase fw-semibold text-primary small mb-2">${topic.tags.slice(0, 2).join(" · ")}</span>
                    <h3 class="card-title fs-5">${topic.title}</h3>
                    <p class="card-text text-muted flex-grow-1">${topic.description}</p>
                    <div class="d-flex align-items-center justify-content-between mt-3">
                        <a class="fw-semibold text-decoration-none" href="${topic.url}">View guide</a>
                        <span class="badge text-bg-light">${new Date(topic.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    </div>
                </div>
            </article>
        `;
        return col;
    };

    const renderTopics = () => {
        if (!topicsGrid) {
            return;
        }
        topicsGrid.innerHTML = "";
        const offset = (state.currentPage - 1) * ITEMS_PER_PAGE;
        const visible = state.filteredTopics.slice(offset, offset + ITEMS_PER_PAGE);

        if (visible.length === 0) {
            const empty = document.createElement("div");
            empty.className = "col-12 text-center text-muted py-5";
            empty.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="mb-3 text-primary" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M10.442 10.442a1 1 0 0 1-1.415 0l-.829-.83a3 3 0 1 1 .707-.707l.83.829a1 1 0 0 1 0 1.415"></path>
                    <path d="M6.5 12a5.5 5.5 0 1 1 3.89-9.39A5.5 5.5 0 0 1 6.5 12m0 1a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13"></path>
                </svg>
                <p class="mb-2 fw-semibold">No topics match that search yet.</p>
                <p class="text-muted mb-0">Try a different keyword or browse the full catalog.</p>
            `;
            topicsGrid.appendChild(empty);
        } else {
            visible.forEach((topic) => {
                topicsGrid.appendChild(createCard(topic));
            });
        }
        renderPagination();
    };

    const renderPagination = () => {
        if (!paginationNode) {
            return;
        }
        paginationNode.innerHTML = "";
        const totalPages = Math.ceil(state.filteredTopics.length / ITEMS_PER_PAGE);

        if (totalPages <= 1) {
            return;
        }

        const addButton = (label, page, isActive = false, isDisabled = false, ariaLabel) => {
            const li = document.createElement("li");
            li.className = `page-item${isDisabled ? " disabled" : ""}${isActive ? " active" : ""}`;
            const button = document.createElement("button");
            button.type = "button";
            button.className = "page-link";
            button.textContent = label;
            if (ariaLabel) {
                button.setAttribute("aria-label", ariaLabel);
            }
            button.disabled = isDisabled;
            button.addEventListener("click", () => {
                if (!isDisabled) {
                    state.currentPage = page;
                    renderTopics();
                    window.scrollTo({ top: document.getElementById("topics").offsetTop - 80, behavior: "smooth" });
                }
            });
            li.appendChild(button);
            paginationNode.appendChild(li);
        };

        addButton("«", Math.max(1, state.currentPage - 1), false, state.currentPage === 1, "Previous page");

        for (let page = 1; page <= totalPages; page += 1) {
            addButton(String(page), page, page === state.currentPage);
        }

        addButton("»", Math.min(totalPages, state.currentPage + 1), false, state.currentPage === totalPages, "Next page");
    };

    const handleSearchInput = () => {
        applyFilters();
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        applyFilters();
    };

    const init = () => {
        updateCurrentYear();
        renderTopics();
        searchInput.addEventListener("input", handleSearchInput);
        searchForm.addEventListener("submit", handleFormSubmit);
        sortSelect.addEventListener("change", applySort);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
