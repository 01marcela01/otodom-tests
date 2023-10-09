function acceptCookies() {
    cy.get('#onetrust-accept-btn-handler').click();
}

function clickFilterOption(itemName) {
    cy.get('.react-select__control').contains(itemName).click();
}

function selectNestedFilterOption(optionName) {
    cy.get('.react-select__option').contains(optionName).click();
}

function clickPlaceFilter(filterName) {
    cy.get('#location').type(filterName);
}

function search() {
    cy.get('#search-form-submit').click();
    cy.wait(5000);
}


describe('otodom app', () => {

    beforeEach(() => {
        cy.viewport(1920, 1280);
        cy.visit('https://www.otodom.pl/');
        cy.wait(1000);
    })

    it('Filtering by location gives results from that location', () => {
        acceptCookies();

        clickFilterOption('Mieszkania');
        selectNestedFilterOption('Domy');

        cy.wait(1000);

        clickFilterOption('Na sprzedaż');
        selectNestedFilterOption("Na sprzedaż");

        cy.wait(1000);

        clickPlaceFilter('Warszawa');

        cy.wait(1000);

        cy.get('[data-testid="checkbox"]').eq(0).click();

        cy.wait(1000);

        cy.get('[data-testid="search-section-bg-wrapper"]').click();

        clickFilterOption('0 km');
        selectNestedFilterOption('0 km');

        search();

        cy.get('article').eq(0).contains('Warszawa');

    })

    it('Filtering by price gives you correct price range', () => {
        acceptCookies();
        cy.get('#priceMin').type('1000000');
        cy.get('#priceMax').type('1200000');
        search();

        cy.get('article').eq(0).contains('zł').then(element => {
            const price = element.text();

            const priceWithoutCurrency = price.replace("zł", "");
            const priceWithoutSpaces = priceWithoutCurrency.replace(/\s/g, "");
            const priceAsNumber = Number.parseInt(priceWithoutSpaces);

            cy.wrap(priceAsNumber).should('be.gte', 1000000);
            cy.wrap(priceAsNumber).should('be.lte', 1200000);
        });
    })

    it('Filtering by price gives you all articles whose price is within the range ', () => {
        acceptCookies();
        cy.get('#priceMin').type('1000000');
        cy.get('#priceMax').type('1200000');
        search();

        cy.get('article span:contains(zł)')
            .not('[data-cy="listing-item-title"]')
            .not('[data-testid="listing-item-owner-name"]')
            .each(value => {
                const cost = value.text();
                if (cost.indexOf('/') == -1) {
                    const priceWithoutCurrency = cost.replace("zł", "");
                    const priceWithoutSpaces = priceWithoutCurrency.replace(/\s/g, "");
                    const priceAsNumber = Number.parseInt(priceWithoutSpaces);

                    cy.wrap(priceAsNumber).should('be.gte', 1000000);
                    cy.wrap(priceAsNumber).should('be.lte', 1200000);
                }

            })
    })


    it('Filtering by area gives you correct area range', () => {
        acceptCookies();

        cy.get('#areaMin').type('47');
        cy.get('#areaMax').type('75');

        search();

        cy.get('article').eq(0).contains(' m²')
            .not('[data-cy="listing-item-title"]')
            .not('[data-testid="listing-item-owner-name"]')
            .then(component => {
                const area = component.text();
                const areaWithoutSquareMeters = area.replace("m²", "");
                const areaWithoutSpaces = areaWithoutSquareMeters.replace(/\s/g, "");
                const areaAsNumber = Number.parseInt(areaWithoutSpaces);

                cy.wrap(areaAsNumber).should('be.gte', 47);
                cy.wrap(areaAsNumber).should('be.lte', 75);
            });
    })

    it('Filtering by area gives you all articles whose area is within the range', () => {
        acceptCookies();
        cy.get('#areaMin').type('47');
        cy.get('#areaMax').type('75');
        search();

        cy.get('article span:contains( m²)')
            .not('[data-cy="listing-item-title"]')
            .not('[data-testid="listing-item-owner-name"]')
            .each(component => {
                const area = component.text();
                const areaWithoutSquareMeters = area.replace("m²", "");
                const areaWithoutSpaces = areaWithoutSquareMeters.replace(/\s/g, "");
                const areaAsNumber = Number.parseInt(areaWithoutSpaces);

                cy.wrap(areaAsNumber).should('be.gte', 47);
                cy.wrap(areaAsNumber).should('be.lte', 75);
            })
    })

    it('The content of the advertisement is consistent with the searched filters', () => {
        acceptCookies();

        clickPlaceFilter('Kraków');
        cy.wait(1000);
        cy.get('[data-testid="checkbox"]').eq(0).click();
        cy.wait(1000);
        cy.get('[data-testid="search-section-bg-wrapper"]').click();

        cy.get('#areaMin').type('45');
        cy.get('#areaMax').type('65');

        cy.wait(1000);

        search();

        cy.get('article').eq(0).contains('Kraków');

        cy.get('article').eq(0).contains(' m²')
            .not('[data-cy="listing-item-title"]')
            .not('[data-testid="listing-item-owner-name"]')
            .then(PageElement => {
                const surface = PageElement.text();
                const surfaceWithoutSquareMeters = surface.replace("m²", "");
                const surfaceWithoutSpaces = surfaceWithoutSquareMeters.replace(/\s/g, "");
                const surfaceAsNumber = Number.parseInt(surfaceWithoutSpaces);

                cy.wrap(surfaceAsNumber).should('be.gte', 45);
                cy.wrap(surfaceAsNumber).should('be.lte', 65);

                cy.get('article').eq(0).click();
                cy.wait(1000);

                cy.get("[aria-label='Adres']").contains('Kraków')
                    .not('[data-testid="ad.breadcrumbs"]')

                cy.get("[aria-label='Powierzchnia']").contains(' m²')
                    .not('[data-testid="ad.breadcrumbs"]')
                    .then(PageComponent => {
                        const areaInMeters = PageComponent.text();
                        const areaInMetersWithoutSquareMeters = areaInMeters.replace("m²", "");
                        const areaInMetersWithoutSpaces = areaInMetersWithoutSquareMeters.replace(/\s/g, "");
                        const areaInMetersAsNumber = Number.parseInt(areaInMetersWithoutSpaces);

                        cy.wrap(areaInMetersAsNumber).should('be.gte', 45);
                        cy.wrap(areaInMetersAsNumber).should('be.lte', 65);
                    })
            })
    })

    it.only('Data from the list is the same as in the advertisement page', () => {
        acceptCookies();

        clickPlaceFilter('Poznań');
        cy.wait(1000);
        cy.get('[data-testid="checkbox"]').eq(0).click();
        cy.wait(1000);
        cy.get('[data-testid="search-section-bg-wrapper"]').click();

        cy.get('#priceMin').type('500000');
        cy.get('#priceMax').type('900000');



        cy.get('#areaMin').type('40');
        cy.get('#areaMax').type('70');

        cy.wait(1000);

        search();

        cy.get('[data-cy="listing-item-title"]').eq(0).then(titleElement => {
            let title = titleElement.text();
        });
    })
})


















