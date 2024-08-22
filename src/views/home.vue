<script setup>
    import { onMounted, ref, computed } from "vue";
    import IconSearch from "../components/icons/icon-search.vue";
    import IconHeart from "../components/icons/icon-heart.vue";
    import IconArrowRight from "../components/icons/icon-arrow-right.vue";
    import IconClose from "../components/icons/icon-close.vue";
    import axios from "axios";
    import debounce from "debounce";

    const charactersData = ref();
    const isLoading = ref(true);
    const search = ref("");
    const pagination = ref({
        currentPage: 1,
        limit: 15,
    });

    const getAnimeCharacters = async () => {
        try {
            isLoading.value = true;
            const { data } = await axios.get(`https://api.jikan.moe/v4/characters?page=${pagination.value.currentPage}&limit=${pagination.value.limit}&q=${search.value}&order_by=favorites&sort=desc`);

            charactersData.value = data;
        } catch (e) {}
        isLoading.value = false;
    };

    const getFilteredAnimeCharacters = debounce((value) => {
        search.value = value;
        pagination.currentPage = 1;
        getAnimeCharacters();
    }, 500);

    const changePage = (page) => {
        pagination.value.currentPage = page;
        getAnimeCharacters();
    };

    const visiblePages = computed(() => {
        const pages = [];
        const start = Math.max(1, pagination.value.currentPage - Math.floor(3 / 2));
        const end = Math.min(charactersData.value?.pagination?.last_visible_page, start + 3 - 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    });

    onMounted(() => {
        getAnimeCharacters();
    });
</script>

<template>
    <div class="">
        <section class="bg-[url(/images/bg-line.jpg)] bg-[size:100%_100%] bg-no-repeat flex items-center justify-center p-10 border-b-2 border-black">
            <div class="max-w-md w-full text-center space-y-10">
                <h1 class="text-2xl font-semibold">Search Anime Characters</h1>
                <div class="relative !mt-12">
                    <span class="absolute top-1/2 -translate-y-1/2 left-2.5"> <icon-search class="size-5" /></span>
                    <input
                        type="text"
                        class="w-full h-12 px-10 text-base font-medium text-black bg-white border-2 border-black rounded-xl"
                        placeholder="Search for characters"
                        :value="search"
                        @input="getFilteredAnimeCharacters($event.target.value)"
                    />
                    <button
                        v-if="search.length"
                        @click="
                            search = '';
                            getAnimeCharacters();
                        "
                        class="absolute top-1/2 right-2.5 -translate-y-1/2"
                    >
                        <icon-close class="size-5" />
                    </button>
                </div>
                <p>
                    Total <strong>{{ isLoading ? 0 : charactersData?.pagination?.items?.total?.toLocaleString() || 0 }}</strong> matching anime characters found Total
                </p>
            </div>
        </section>

        <section class="px-12 py-10">
            <div v-if="isLoading" class="space-y-4">
                <div v-for="i in 3" :key="i" class="flex p-5 gap-5 border-2 border-black">
                    <div class="size-16 bg-slate-200 animate-pulse"></div>
                    <div class="flex-1 flex flex-col gap-2">
                        <div class="h-4 max-w-md bg-slate-200 animate-pulse"></div>
                        <div class="h-4 max-w-lg bg-slate-200 animate-pulse mt-4"></div>
                    </div>
                    <div class="size-16 bg-slate-200 animate-pulse"></div>
                </div>
            </div>
            <div v-else-if="charactersData && !charactersData.data.length">
                <p class="text-xl text-center py-20">No results found!</p>
            </div>
            <div v-else>
                <div class="space-y-4">
                    <div v-for="character in charactersData.data" :key="character.mal_id" class="flex divide-x-2 divide-black border-2 border-black">
                        <div class="flex-1 flex p-4 gap-4">
                            <div class="flex items-center justify-center size-16 overflow-hidden">
                                <img v-if="character?.images?.jpg?.image_url" :src="character?.images?.jpg?.image_url" class="w-full object-cover" />
                                <img v-else-if="character?.images?.webp?.image_url" :src="character?.images?.webp?.image_url" class="w-full object-cover" />
                                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6">
                                    <circle cx="12" cy="6" r="4" stroke="currentColor" stroke-width="1.5"></circle>
                                    <path opacity="0.5" d="M20 17.5C20 19.9853 20 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C16.4183 13 20 15.0147 20 17.5Z" stroke="currentColor" stroke-width="1.5"></path>
                                </svg>
                            </div>
                            <div class="flex-1 flex flex-col gap-1">
                                <div class="flex items-center gap-4">
                                    <h2 class="text-xl font-semibold">{{ character.name }}</h2>
                                    <div class="ml-auto flex items-center gap-1">
                                        <icon-heart class="size-5 fill-red-600 text-red-600" />
                                        {{ character.favorites }}
                                    </div>
                                </div>
                                <div class="flex items-center gap-2 flex-wrap mt-auto">
                                    <div v-for="(nickname, i) in character.nicknames" :key="i" class="text-sm bg-gray-200 border border-black rounded px-2 py-0.5">{{ nickname }}</div>
                                </div>
                            </div>
                        </div>
                        <div class="shrink-0 p-4 flex">
                            <a :href="character.url" target="_blank" class="text-purple-400 hover:text-purple-500 flex items-center justify-center">
                                <icon-arrow-right class="[&>path]:stroke-[8px] size-10" />
                            </a>
                        </div>
                    </div>
                </div>
                <div class="mt-10 flex items-center justify-end gap-4">
                    <select
                        :value="pagination.limit"
                        @change="
                            pagination.limit = $event.target.value;
                            pagination.currentPage = 1;
                            getAnimeCharacters();
                        "
                        class="bg-white border-2 border-black text-black h-9 px-2"
                    >
                        <option value="15">15</option>
                        <option value="25">25</option>
                        <option value="35">35</option>
                    </select>
                    <button class="border-2 border-black enabled:hover:border-purple-400 enabled:hover:text-purple-400 px-2 py-1 disabled:opacity-60" :disabled="pagination.currentPage === 1" @click="changePage(1)">First</button>
                    <button
                        class="border-2 border-black enabled:hover:border-purple-400 enabled:hover:text-purple-400 px-2 py-1 disabled:opacity-60"
                        :disabled="pagination.currentPage === 1"
                        @click="changePage(pagination.currentPage > 1 ? pagination.currentPage - 1 : 1)"
                    >
                        Prev
                    </button>

                    <button
                        class="border-2 border-black hover:border-purple-400 hover:text-purple-400 px-2 py-1 disabled:opacity-60"
                        v-for="page in visiblePages"
                        :key="page"
                        @click="changePage(page)"
                        :class="{ 'border-purple-400 text-purple-400': page === pagination.currentPage }"
                    >
                        {{ page }}
                    </button>

                    <div v-if="visiblePages[visiblePages.length - 1] < charactersData?.pagination?.last_visible_page">...</div>

                    <button
                        class="border-2 border-black enabled:hover:border-purple-400 enabled:hover:text-purple-400 px-2 py-1 disabled:opacity-60"
                        :disabled="pagination.currentPage === charactersData?.pagination?.last_visible_page"
                        @click="changePage(pagination.currentPage < charactersData?.pagination?.last_visible_page ? pagination.currentPage + 1 : charactersData?.pagination?.last_visible_page)"
                    >
                        Next
                    </button>
                    <button
                        class="border-2 border-black enabled:hover:border-purple-400 enabled:hover:text-purple-400 px-2 py-1 disabled:opacity-60"
                        :disabled="pagination.currentPage === charactersData?.pagination?.last_visible_page"
                        @click="changePage(charactersData?.pagination?.last_visible_page)"
                    >
                        Last
                    </button>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped></style>
