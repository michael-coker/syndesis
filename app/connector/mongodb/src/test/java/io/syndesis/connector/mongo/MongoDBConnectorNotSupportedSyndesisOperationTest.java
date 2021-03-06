/*
 * Copyright (C) 2016 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.syndesis.connector.mongo;

import io.syndesis.common.model.integration.Step;
import org.junit.Before;
import org.junit.Test;

import java.util.List;

public class MongoDBConnectorNotSupportedSyndesisOperationTest extends MongoDBConnectorTestSupport {

    @Override
    protected List<Step> createSteps() {
        return fromDirectToMongo("start", "io.syndesis.connector:connector-mongodb-producer", DATABASE,
            COLLECTION, "aggregate");
    }

    // **************************
    // Tests
    // **************************

    @Test(expected = Exception.class)
    public void mongoTest() {
        template().sendBody("direct:start","Anything....");
        fail("Aggregate operation is not allowed, should thrown an exception!");
    }

}
