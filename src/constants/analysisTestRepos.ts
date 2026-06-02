// ADMIN 분석 테스트용 큐레이션 공개 repo 풀(프레임워크별). 비용 때문에 기본 11개만 디스패치한다.
// 중간 크기·식별 가능한 dominant 기여자 우선(Lambda p0 size 가드 초과 시 교체 대상).

export type FrameworkRepoType = {
    framework: string;
    repoUrl: string;
};

export const ANALYSIS_TEST_REPO_LIST: FrameworkRepoType[] = [
    { framework: 'Spring Boot', repoUrl: 'https://github.com/spring-projects/spring-petclinic' },
    { framework: 'Spring Boot', repoUrl: 'https://github.com/spring-guides/gs-spring-boot' },
    { framework: 'Django', repoUrl: 'https://github.com/wsvincent/djangox' },
    { framework: 'Django', repoUrl: 'https://github.com/gothinkster/django-realworld-example-app' },
    { framework: 'Flask', repoUrl: 'https://github.com/miguelgrinberg/microblog' },
    { framework: 'Flask', repoUrl: 'https://github.com/pallets/flask' },
    { framework: 'FastAPI', repoUrl: 'https://github.com/tiangolo/full-stack-fastapi-template' },
    { framework: 'Express', repoUrl: 'https://github.com/hagopj13/node-express-boilerplate' },
    { framework: 'NestJS', repoUrl: 'https://github.com/nestjs/typescript-starter' },
    { framework: 'Gin', repoUrl: 'https://github.com/eddycjy/go-gin-example' },
    { framework: 'Laravel', repoUrl: 'https://github.com/laravel/laravel' },
    { framework: 'Rails', repoUrl: 'https://github.com/gothinkster/rails-realworld-example-app' },
    { framework: 'ASP.NET Core', repoUrl: 'https://github.com/jasontaylordev/CleanArchitecture' },
    { framework: 'React', repoUrl: 'https://github.com/gothinkster/react-redux-realworld-example-app' },
    { framework: 'Vue', repoUrl: 'https://github.com/gothinkster/vue-realworld-example-app' },
    { framework: 'Angular', repoUrl: 'https://github.com/gothinkster/angular-realworld-example-app' },
    { framework: 'Next.js', repoUrl: 'https://github.com/vercel/next-learn' },
    { framework: 'Svelte', repoUrl: 'https://github.com/sveltejs/realworld' },
    { framework: 'Go', repoUrl: 'https://github.com/spf13/cobra' },
    { framework: 'Python', repoUrl: 'https://github.com/psf/requests' },
];

export const ANALYSIS_TEST_REPO_POOL_SIZE = ANALYSIS_TEST_REPO_LIST.length;
export const ANALYSIS_TEST_REPO_MAX_COUNT = 300; // BE test-batch 상한과 동일
export const ANALYSIS_TEST_REPO_DEFAULT_COUNT = 11;

// isEvenSpread=true 일 때 프레임워크별 그룹을 라운드로빈으로 순회한 기본 순서(다양성 최대화).
const buildEvenSpreadOrder = (): string[] => {
    const groupMap = new Map<string, string[]>();
    for (const { framework, repoUrl } of ANALYSIS_TEST_REPO_LIST) {
        const groupList = groupMap.get(framework) ?? [];
        groupList.push(repoUrl);
        groupMap.set(framework, groupList);
    }

    const frameworkGroupList = Array.from(groupMap.values());
    const orderedList: string[] = [];
    let round = 0;
    while (orderedList.length < ANALYSIS_TEST_REPO_POOL_SIZE) {
        let isProgressed = false;
        for (const groupList of frameworkGroupList) {
            if (round < groupList.length) {
                orderedList.push(groupList[round]);
                isProgressed = true;
            }
        }
        if (!isProgressed) break;
        round += 1;
    }
    return orderedList;
};

/**
 * count개의 repoUrl을 고른다.
 * - isEvenSpread=true: 프레임워크 라운드로빈 순서로 정렬.
 * - isEvenSpread=false: 풀 원래 순서.
 * 풀 크기(20개)를 초과하면 동시성 부하 테스트를 위해 풀을 반복 사용한다(중복 repoUrl 허용).
 */
export const pickRepoUrlList = (count: number, isEvenSpread: boolean): string[] => {
    const safeCount = Math.max(1, Math.min(count, ANALYSIS_TEST_REPO_MAX_COUNT));
    const baseList = isEvenSpread
        ? buildEvenSpreadOrder()
        : ANALYSIS_TEST_REPO_LIST.map((item) => item.repoUrl);

    const pickedList: string[] = [];
    for (let i = 0; i < safeCount; i += 1) {
        pickedList.push(baseList[i % baseList.length]);
    }
    return pickedList;
};
